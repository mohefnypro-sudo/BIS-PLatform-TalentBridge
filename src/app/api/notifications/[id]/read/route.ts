import { apiError, json, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: Params) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;
  const { id } = await params;

  const notification = await prisma.notification.findFirst({ where: { id, userId: user.id } });
  if (!notification) return apiError("Notification not found.", 404);

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return json(updated);
}
