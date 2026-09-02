import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { certificationSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = certificationSchema.parse(await req.json());
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Student profile not found.", 404);

    const cert = await prisma.certification.create({
      data: {
        studentId: profile.id,
        name: body.name,
        issuer: body.issuer,
        url: body.url,
        issuedAt: body.issuedAt,
        verifyId: body.verifyId,
      },
    });

    return json(cert, 201);
  } catch (error) {
    return handleError(error);
  }
}
