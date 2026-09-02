import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { certificationSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;
  const { id } = await params;

  try {
    const body = certificationSchema.partial().parse(await req.json());
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Student profile not found.", 404);

    const existing = await prisma.certification.findFirst({ where: { id, studentId: profile.id } });
    if (!existing) return apiError("Certification not found.", 404);

    const updated = await prisma.certification.update({ where: { id }, data: body });
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

  const existing = await prisma.certification.findFirst({ where: { id, studentId: profile.id } });
  if (!existing) return apiError("Certification not found.", 404);

  await prisma.certification.delete({ where: { id } });
  return json({ ok: true });
}
