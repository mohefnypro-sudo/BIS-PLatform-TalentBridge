import { json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q") ?? "";

  const projects = await prisma.graduationProject.findMany({
    where: {
      ...(status ? { status: status as never } : { status: { in: ["SUBMITTED", "APPROVED", "REJECTED"] } }),
      ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    },
    include: {
      owner: { include: { user: { select: { name: true, image: true } } } },
      members: { include: { student: { include: { user: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return json(projects);
}
