import { apiError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return apiError("Student profile not found.", 404);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const applications = await prisma.application.findMany({
    where: { studentId: profile.id, ...(status ? { status: status as never } : {}) },
    include: {
      job: {
        include: { track: { select: { name: true, color: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return json(applications);
}
