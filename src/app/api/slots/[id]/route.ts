import { apiError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const result = await requireRole("MENTOR");
  if (result.error) return result.error;
  const { user } = result;
  const { id } = await params;

  const profile = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return apiError("Mentor profile not found.", 404);

  const slot = await prisma.availabilitySlot.findFirst({ where: { id, mentorProfileId: profile.id } });
  if (!slot) return apiError("Slot not found.", 404);
  if (slot.isBooked) return apiError("Cannot delete a booked slot.", 409);

  await prisma.availabilitySlot.delete({ where: { id } });
  return json({ ok: true });
}
