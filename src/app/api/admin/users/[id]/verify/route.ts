import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { verifyUserSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;
  const { id } = await params;

  try {
    const body = verifyUserSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("User not found.", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        status: body.status,
        verifiedAt: body.status === "ACTIVE" ? new Date() : user.verifiedAt,
      },
    });

    await notify({
      userId: id,
      type: "SYSTEM",
      title: body.status === "ACTIVE" ? "Account verified ✅" : `Account ${body.status.toLowerCase()}`,
      body:
        body.status === "ACTIVE"
          ? "Your account has been verified by the platform administrators. You can now fully use TalentBridge."
          : body.status === "SUSPENDED"
            ? "Your account has been suspended. Contact support for details."
            : body.status === "REJECTED"
              ? "Your verification was rejected. Please review your information and try again."
              : "Your account is pending verification.",
      link: "/dashboard",
    });

    return json({ id: updated.id, status: updated.status });
  } catch (error) {
    return handleError(error);
  }
}
