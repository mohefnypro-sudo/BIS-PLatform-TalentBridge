import { hash } from "bcryptjs";
import { apiError, handleError, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { notify } from "@/lib/notifications";
import { LEVEL_TO_TIER } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
    if (existing) return apiError("An account with this email already exists.", 409);

    const passwordHash = await hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        passwordHash,
        role: body.role,
        status: "PENDING",
        ...(body.role === "STUDENT"
          ? {
              studentProfile: {
                create: { level: "FRESHMAN", tier: LEVEL_TO_TIER.FRESHMAN },
              },
            }
          : {}),
        ...(body.role === "MENTOR"
          ? {
              mentorProfile: {
                create: {
                  sessionLengths: [15, 30, 60],
                  isFree: body.isFree ?? false,
                  domains: [],
                },
              },
            }
          : {}),
      },
    });

    await notify({
      userId: user.id,
      type: "SYSTEM",
      title: "Welcome to TalentBridge 👋",
      body:
        body.role === "STUDENT"
          ? "Your Growth-tier student profile is ready. Choose a career track and add your first milestone."
          : body.role === "MENTOR"
            ? "Your mentor profile is ready. Set your domains, availability and session lengths."
            : "Your recruiter account is ready. Post your first job or training opportunity.",
      link: "/dashboard",
    });

    return json({ id: user.id, email: user.email, role: user.role }, 201);
  } catch (error) {
    return handleError(error);
  }
}
