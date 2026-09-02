import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { slotSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const result = await requireRole("MENTOR");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = slotSchema.parse(await req.json());

    const profile = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Mentor profile not found.", 404);

    if (body.endsAt <= body.startsAt) return apiError("End time must be after start time.", 422);
    if (body.startsAt < new Date()) return apiError("Cannot create slots in the past.", 422);

    // Bulk create a weekly template if a `days` array is present
    const raw = await req.clone().json().catch(() => body);
    const days: number[] | undefined = raw.days;

    if (Array.isArray(days) && days.length > 0) {
      const created = [];
      for (const day of days) {
        const starts = new Date(body.startsAt);
        while (starts.getDay() !== day) starts.setDate(starts.getDate() + 1);
        const slot = await prisma.availabilitySlot.create({
          data: { mentorProfileId: profile.id, startsAt: starts, endsAt: body.endsAt },
        });
        created.push(slot);
      }
      return json({ created }, 201);
    }

    const slot = await prisma.availabilitySlot.create({
      data: { mentorProfileId: profile.id, startsAt: body.startsAt, endsAt: body.endsAt },
    });

    return json(slot, 201);
  } catch (error) {
    return handleError(error);
  }
}
