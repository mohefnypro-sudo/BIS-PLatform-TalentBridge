import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { updateStudentLevel } from "@/lib/tier";
import { studentProfileSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      careerTrack: { select: { id: true, name: true, slug: true, color: true, skills: true } },
      certifications: { orderBy: { issuedAt: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
      milestones: {
        include: { track: { select: { id: true, name: true, color: true } } },
        orderBy: { createdAt: "asc" },
      },
      projects: { include: { project: true } },
      user: { select: { id: true, name: true, email: true, image: true, bio: true, phone: true, status: true } },
    },
  });

  if (!profile) return apiError("Student profile not found. Complete onboarding first.", 404);

  return json(profile);
}

export async function PATCH(req: Request) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = studentProfileSchema.parse(await req.json());

    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Student profile not found.", 404);

    const { level, ...rest } = body;
    const updated = await prisma.studentProfile.update({ where: { id: profile.id }, data: rest });

    if (level && level !== profile.level) {
      const { tier } = await updateStudentLevel(user.id, level);
      return json({ ...updated, level, tier });
    }

    return json(updated);
  } catch (error) {
    return handleError(error);
  }
}
