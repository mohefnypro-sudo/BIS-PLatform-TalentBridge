import { json, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;

  const count = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  return json({ count });
}
