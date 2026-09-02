import { json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const role = url.searchParams.get("role");
  const q = url.searchParams.get("q") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = 20;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(role ? { role: role as never } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        studentProfile: { select: { tier: true, level: true, showcase: true } },
        mentorProfile: { select: { isVerified: true, domains: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
