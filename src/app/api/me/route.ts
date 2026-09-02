import { z } from "zod";
import { apiError, handleError, json, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(2000).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  image: z.string().max(500).optional().nullable(),
});

export async function GET() {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      studentProfile: {
        include: { careerTrack: { select: { id: true, name: true, slug: true, color: true } } },
      },
      mentorProfile: true,
    },
  });

  return json(data);
}

export async function PATCH(req: Request) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;

  try {
    const body = updateMeSchema.parse(await req.json());
    const updated = await prisma.user.update({ where: { id: user.id }, data: body });
    return json({ id: updated.id, name: updated.name, bio: updated.bio, phone: updated.phone, image: updated.image });
  } catch (error) {
    return handleError(error);
  }
}
