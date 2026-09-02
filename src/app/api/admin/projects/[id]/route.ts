import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const statusSchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ARCHIVED"]),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;
  const { id } = await params;

  try {
    const body = statusSchema.parse(await req.json());
    const existing = await prisma.graduationProject.findUnique({
      where: { id },
      include: { owner: { include: { user: { select: { id: true } } } } },
    });
    if (!existing) return apiError("Project not found.", 404);

    const updated = await prisma.graduationProject.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
      },
    });

    const ownerUserId = existing.owner?.user.id;
    if (ownerUserId) {
      await notify({
        userId: ownerUserId,
        type: "PROJECT",
        title:
          body.status === "APPROVED"
            ? "Your project is live! 🚀"
            : body.status === "REJECTED"
              ? "Project rejected"
              : `Project ${body.status.toLowerCase()}`,
        body:
          body.status === "APPROVED"
            ? `"${existing.title}" is now visible in the graduation projects directory.`
            : body.status === "REJECTED"
              ? `"${existing.title}" was rejected. Review the guidelines and resubmit.`
              : `Your project "${existing.title}" was updated.`,
        link: `/projects/${existing.slug}`,
      });
    }

    return json(updated);
  } catch (error) {
    return handleError(error);
  }
}
