import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = experienceSchema.parse(await req.json());
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Student profile not found.", 404);

    const experience = await prisma.experience.create({
      data: {
        studentId: profile.id,
        title: body.title,
        company: body.company,
        companyLogo: body.companyLogo,
        startDate: body.startDate,
        endDate: body.endDate,
        current: body.current ?? false,
        description: body.description,
        skills: body.skills ?? [],
      },
    });

    return json(experience, 201);
  } catch (error) {
    return handleError(error);
  }
}
