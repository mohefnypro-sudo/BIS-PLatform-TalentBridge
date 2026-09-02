import { z } from "zod";
import { apiError, handleError, json, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const memberSchema = z.object({
  studentId: z.string().min(1),
  roleInProject: z.string().max(80).optional(),
  isLead: z.boolean().optional(),
});

export async function POST(req: Request, { params }: Params) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;
  const { id } = await params;

  const project = await prisma.graduationProject.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!project) return apiError("Project not found.", 404);

  const isAdmin = user.role === "ADMIN";
  const isOwner = project.ownerId
    ? (await prisma.studentProfile.findUnique({ where: { userId: user.id } }))?.id === project.ownerId
    : false;
  if (!isAdmin && !isOwner) return apiError("Forbidden. Only the project owner can add members.", 403);

  try {
    const body = memberSchema.parse(await req.json());

    const targetProfile = await prisma.studentProfile.findUnique({
      where: { id: body.studentId },
      include: { user: { select: { id: true } } },
    });
    if (!targetProfile) return apiError("Student not found.", 404);

    const exists = await prisma.projectMember.findFirst({
      where: { projectId: id, studentId: body.studentId },
    });
    if (exists) return apiError("Student is already a member of this project.", 409);

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        studentId: body.studentId,
        roleInProject: body.roleInProject ?? "Member",
        isLead: body.isLead ?? false,
      },
    });

    await notify({
      userId: targetProfile.user.id,
      type: "PROJECT",
      title: "You've been added to a project team",
      body: `You were added as ${member.roleInProject} to "${project.title}".`,
      link: `/projects/${project.slug}`,
    });

    return json(member, 201);
  } catch (error) {
    return handleError(error);
  }
}
