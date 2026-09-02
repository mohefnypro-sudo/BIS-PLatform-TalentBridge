import { json, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(_req: Request) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return json({ ok: true });
}
