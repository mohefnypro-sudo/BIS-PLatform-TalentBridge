import { apiError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const result = await requireRole("RECRUITER", "ADMIN");
  if (result.error) return result.error;
  const { user } = result;
  const { id } = await params;

  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job) return apiError("Job not found.", 404);
  if (job.recruiterId !== user.id && user.role !== "ADMIN") return apiError("Forbidden.", 403);

  const applications = await prisma.application.findMany({
    where: { jobId: id },
    include: {
      student: {
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
          careerTrack: { select: { name: true, color: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return json(applications);
}
