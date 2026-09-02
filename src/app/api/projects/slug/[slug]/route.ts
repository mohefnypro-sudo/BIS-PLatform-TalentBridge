import { apiError, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  const project = await prisma.graduationProject.findUnique({
    where: { slug },
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
  if (project.status !== "APPROVED" || project.visibility !== "PUBLIC") {
    return apiError("Project not found.", 404);
  }
  return json(project);
}
