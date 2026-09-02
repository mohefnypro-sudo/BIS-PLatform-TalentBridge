import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { milestoneSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;
  const { id } = await params;

  try {
    const body = milestoneSchema.partial().parse(await req.json());

    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Student profile not found.", 404);

    const existing = await prisma.studentMilestone.findFirst({ where: { id, studentId: profile.id } });
    if (!existing) return apiError("Milestone not found.", 404);

    const updated = await prisma.studentMilestone.update({
      where: { id },
      data: { ...body, achievedAt: body.status === "COMPLETED" ? new Date() : existing.achievedAt },
    });

    return json(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;
  const { id } = await params;

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return apiError("Student profile not found.", 404);

  const existing = await prisma.studentMilestone.findFirst({ where: { id, studentId: profile.id } });
  if (!existing) return apiError("Milestone not found.", 404);

  await prisma.studentMilestone.delete({ where: { id } });
  return json({ ok: true });
}
