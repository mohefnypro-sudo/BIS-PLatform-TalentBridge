import { z } from "zod";
import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { updateStudentLevel } from "@/lib/tier";
import type { AcademicLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

const levelSchema = z.object({
  level: z.enum(["FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR", "GRADUATE"]),
});

export async function PATCH(req: Request) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const { level } = levelSchema.parse(await req.json());

    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Student profile not found.", 404);

    const escalation = await updateStudentLevel(user.id, level as AcademicLevel);

    return json(escalation);
  } catch (error) {
    return handleError(error);
  }
}
