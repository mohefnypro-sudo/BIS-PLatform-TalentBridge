import { apiError, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { findActiveRanges } from "@/lib/booking";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(req.url);
  const from = new Date(url.searchParams.get("from") ?? new Date());
  const to = new Date(url.searchParams.get("to") ?? new Date(Date.now() + 14 * 86400000));

  const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
  if (!mentor) return apiError("Mentor not found.", 404);

  const [freeSlots, bookedRanges] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: { mentorProfileId: id, isBooked: false, startsAt: { gte: from, lt: to } },
      orderBy: { startsAt: "asc" },
    }),
    findActiveRanges(id, from, to),
  ]);

  return json({ freeSlots, bookedRanges, sessionLengths: mentor.sessionLengths, isFree: mentor.isFree, hourlyRate: mentor.hourlyRate });
}
