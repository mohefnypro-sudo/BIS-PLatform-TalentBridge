import { apiError, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true, bio: true, phone: true } },
      slots: {
        where: { isBooked: false, startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 30,
      },
    },
  });

  if (!mentor) return apiError("Mentor not found.", 404);
  return json(mentor);
}
