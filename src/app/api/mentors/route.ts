import { json } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const domain = url.searchParams.get("domain");
  const verifiedOnly = url.searchParams.get("verified") === "true";

  const mentors = await prisma.mentorProfile.findMany({
    where: {
      calendarEnabled: true,
      ...(verifiedOnly ? { isVerified: true } : {}),
      ...(domain ? { domains: { has: domain } } : {}),
      ...(q
        ? {
            OR: [
              { headline: { contains: q, mode: "insensitive" as const } },
              { bio: { contains: q, mode: "insensitive" as const } },
              { domains: { has: q } },
              { user: { name: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true, bio: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: [{ isVerified: "desc" }, { totalSessions: "desc" }],
    take: 60,
  });

  return json(mentors);
}
