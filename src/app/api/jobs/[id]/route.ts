import { apiError, handleError, json, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  await prisma.jobPosting.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => null);

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      recruiter: { select: { id: true, name: true, email: true } },
      track: { select: { name: true, color: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job) return apiError("Job not found.", 404);
  return json(job);
}

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;
  const { id } = await params;

  const existing = await prisma.jobPosting.findUnique({ where: { id } });
  if (!existing) return apiError("Job not found.", 404);
  if (existing.recruiterId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden. You do not own this job posting.", 403);
  }

  try {
    const body = jobSchema.partial().parse(await req.json());
    const updated = await prisma.jobPosting.update({ where: { id }, data: body });
    return json(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;
  const { id } = await params;

  const existing = await prisma.jobPosting.findUnique({ where: { id } });
  if (!existing) return apiError("Job not found.", 404);
  if (existing.recruiterId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden.", 403);
  }

  await prisma.jobPosting.delete({ where: { id } });
  return json({ ok: true });
}
