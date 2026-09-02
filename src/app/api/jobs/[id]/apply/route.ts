import { z } from "zod";
import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const applySchema = z.object({
  coverLetter: z.string().max(5000).optional().nullable(),
});

export async function POST(req: Request, { params }: Params) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;
  const { id } = await params;

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return apiError("Complete your student profile first.", 404);

  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job) return apiError("Job not found.", 404);
  if (job.status !== "OPEN") return apiError("This position is no longer accepting applications.", 409);
  if (job.applicationDeadline && job.applicationDeadline < new Date()) {
    return apiError("The application deadline has passed.", 409);
  }

  try {
    const body = applySchema.parse(await req.json());

    const existing = await prisma.application.findUnique({
      where: { jobId_studentId: { jobId: id, studentId: profile.id } },
    });
    if (existing) return apiError("You have already applied to this position.", 409);

    const snapshot = {
      name: user.name,
      level: profile.level,
      tier: profile.tier,
      headline: profile.headline,
      bio: profile.bio,
      skills: profile.featuredSkills,
      github: profile.github,
      linkedin: profile.linkedin,
      resumeUrl: profile.resumeUrl,
      graduationYear: profile.graduationYear,
      gpa: profile.gpa,
    };

    const application = await prisma.application.create({
      data: {
        jobId: id,
        studentId: profile.id,
        coverLetter: body.coverLetter,
        snapshot,
      },
    });

    await notify({
      userId: job.recruiterId,
      type: "APPLICATION",
      title: "New application received",
      body: `${user.name} applied for "${job.title}".`,
      link: `/dashboard?tab=applications`,
    });

    return json(application, 201);
  } catch (error) {
    return handleError(error);
  }
}
