import { apiError, handleError, json, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const project = await prisma.graduationProject.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          student: {
            include: {
              user: { select: { id: true, name: true, image: true, email: true } },
              careerTrack: { select: { name: true, color: true } },
            },
          },
        },
      },
      owner: { include: { user: { select: { name: true, image: true } } } },
    },
  });

  if (!project) return apiError("Project not found.", 404);
  if (project.status !== "APPROVED" && project.visibility !== "PUBLIC") {
    const session = await requireUser();
    if (session.error) return apiError("Project not found.", 404);
    return json(project);
  }

  return json(project);
}

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;
  const { id } = await params;

  const existing = await prisma.graduationProject.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!existing) return apiError("Project not found.", 404);

  const isAdmin = user.role === "ADMIN";
  const isOwner = existing.ownerId
    ? (await prisma.studentProfile.findUnique({ where: { userId: user.id } }))?.id === existing.ownerId
    : false;
  const isMember = existing.members.some(
    (m) => m.studentId === (user.studentProfileId ?? user.id) || m.studentId === existing.ownerId,
  );

  if (!isAdmin && !isOwner && !isMember) return apiError("Forbidden. You do not own this project.", 403);

  try {
    const { members: _members, ...rest } = projectSchema.partial().parse(await req.json());
    const updated = await prisma.graduationProject.update({ where: { id }, data: rest });
    return json(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;
  const { id } = await params;

  const existing = await prisma.graduationProject.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!existing) return apiError("Project not found.", 404);

  const isAdmin = user.role === "ADMIN";
  const isOwner = existing.ownerId
    ? (await prisma.studentProfile.findUnique({ where: { userId: user.id } }))?.id === existing.ownerId
    : false;

  if (!isAdmin && !isOwner) return apiError("Forbidden.", 403);

  await prisma.graduationProject.delete({ where: { id } });
  return json({ ok: true });
}
