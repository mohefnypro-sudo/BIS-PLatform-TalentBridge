import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { milestoneSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = milestoneSchema.parse(await req.json());
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Student profile not found.", 404);

    const milestone = await prisma.studentMilestone.create({
      data: {
        studentId: profile.id,
        trackId: body.trackId,
        title: body.title,
        description: body.description,
        resourceUrl: body.resourceUrl,
        status: body.status ?? "PLANNED",
        progress: body.progress ?? 0,
      },
    });

    return json(milestone, 201);
  } catch (error) {
    return handleError(error);
  }
}
