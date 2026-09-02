import { json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const [totalUsers, pendingVerifications, totalProjects, approvedProjects, totalJobs, openJobs, totalBookings, totalApplications, topTracks] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.graduationProject.count(),
      prisma.graduationProject.count({ where: { status: "APPROVED" } }),
      prisma.jobPosting.count(),
      prisma.jobPosting.count({ where: { status: "OPEN" } }),
      prisma.booking.count(),
      prisma.application.count(),
      prisma.studentProfile.groupBy({
        by: ["careerTrackId"],
        _count: { _all: true },
        orderBy: { _count: { careerTrackId: "desc" } },
        take: 5,
      }),
    ]);

  const trackNames = await prisma.careerTrack.findMany({
    where: { id: { in: topTracks.map((t) => t.careerTrackId).filter(Boolean) as string[] } },
    select: { id: true, name: true, color: true },
  });

  const byRole = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  const byStatus = await prisma.user.groupBy({ by: ["status"], _count: { _all: true } });

  return json({
    totalUsers,
    pendingVerifications,
    totalProjects,
    approvedProjects,
    totalJobs,
    openJobs,
    totalBookings,
    totalApplications,
    topTracks: topTracks.map((t) => ({
      track: trackNames.find((n) => n.id === t.careerTrackId)?.name ?? "Unassigned",
      color: trackNames.find((n) => n.id === t.careerTrackId)?.color ?? null,
      count: t._count._all,
    })),
    byRole,
    byStatus,
  });
}
