import { apiError, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const profile = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true, bio: true } },
      careerTrack: { select: { id: true, name: true, color: true, skills: true } },
      certifications: { orderBy: { issuedAt: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
      milestones: {
        where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
        include: { track: { select: { name: true, color: true } } },
        orderBy: { createdAt: "asc" },
      },
      projects: {
        include: { project: true },
      },
    },
  });

  if (!profile || !profile.showcase) return apiError("Portfolio not found or not public.", 404);

  return json(profile);
}
