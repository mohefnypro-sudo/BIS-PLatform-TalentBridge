import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { applicationStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireRole("RECRUITER", "ADMIN");
  if (result.error) return result.error;
  const { user } = result;
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { select: { recruiterId: true, title: true } },
      student: { include: { user: { select: { id: true } } } },
    },
  });
  if (!application) return apiError("Application not found.", 404);
  if (application.job.recruiterId !== user.id && user.role !== "ADMIN") return apiError("Forbidden.", 403);

  try {
    const body = applicationStatusSchema.parse(await req.json());

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        recruiterNotes: body.recruiterNotes,
        viewedAt: new Date(),
      },
    });

    const messages: Record<string, { title: string; body: string }> = {
      UNDER_REVIEW: { title: "Application under review", body: `Your application for "${application.job.title}" is now under review.` },
      INTERVIEW: { title: "You've been shortlisted! 🎉", body: `Great news — you've been invited to an interview for "${application.job.title}".` },
      ACCEPTED: { title: "Offer extended! 🎉", body: `Congratulations! You've been accepted for "${application.job.title}".` },
      REJECTED: { title: "Application update", body: `Thank you for applying to "${application.job.title}". Unfortunately, the position has been filled by another candidate.` },
    };

    const msg = messages[body.status];
    if (msg) {
      await notify({
        userId: application.student.user.id,
        type: "APPLICATION",
        title: msg.title,
        body: msg.body,
        link: "/dashboard?tab=applications",
      });
    }

    return json(updated);
  } catch (error) {
    return handleError(error);
  }
}
