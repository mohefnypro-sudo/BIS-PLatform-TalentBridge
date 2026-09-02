import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { mentorProfileSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await requireRole("MENTOR");
  if (result.error) return result.error;
  const { user } = result;

  const profile = await prisma.mentorProfile.findUnique({
    where: { userId: user.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  if (!profile) return apiError("Mentor profile not found.", 404);
  return json(profile);
}

export async function PATCH(req: Request) {
  const result = await requireRole("MENTOR");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = mentorProfileSchema.parse(await req.json());
    const profile = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Mentor profile not found.", 404);

    const updated = await prisma.mentorProfile.update({ where: { id: profile.id }, data: body });
    return json(updated);
  } catch (error) {
    return handleError(error);
  }
}
