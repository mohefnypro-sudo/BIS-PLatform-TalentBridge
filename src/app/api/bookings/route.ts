import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { BookingError, createBooking } from "@/lib/booking";
import { notifyBookingMentor } from "@/lib/notifications";
import { bookingSchema } from "@/lib/validators";
import type { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const result = await requireRole("STUDENT", "MENTOR");
  if (result.error) return result.error;
  const { user } = result;

  const url = new URL(req.url);
  const tab = url.searchParams.get("tab"); // upcoming | past
  const now = new Date();

  const baseWhere =
    user.role === "MENTOR"
      ? user.mentorProfileId
        ? { mentorProfileId: user.mentorProfileId }
        : {}
      : user.studentProfileId
        ? { studentId: user.studentProfileId }
        : {};

  const activeStatuses: BookingStatus[] = ["PENDING", "APPROVED"];
  const pastStatuses: BookingStatus[] = ["COMPLETED", "CANCELLED", "DECLINED"];

  const where = {
    ...baseWhere,
    ...(tab === "past"
      ? { endsAt: { lt: now }, status: { in: pastStatuses } }
      : tab === "requests"
        ? { status: "PENDING" as const }
        : { status: { in: activeStatuses } }),
  };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      student: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
      mentor: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: { scheduledFor: user.role === "MENTOR" && tab === "requests" ? "asc" : "desc" },
  });

  return json(bookings);
}

export async function POST(req: Request) {
  const result = await requireRole("STUDENT");
  if (result.error) return result.error;
  const { user } = result;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return apiError("Complete your student profile first.", 404);

  try {
    const body = bookingSchema.parse(await req.json());
    const { id } = await createBooking({
      studentProfileId: profile.id,
      mentorProfileId: body.mentorProfileId,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      sessionLength: body.sessionLength,
      sessionType: body.sessionType,
      preSessionQuestions: body.preSessionQuestions,
      notes: body.notes,
    });

    await notifyBookingMentor(
      id,
      "New booking request",
      `${profile.user.name ?? "A student"} requested a ${body.sessionLength}-minute session (${body.sessionType}).`,
      "/dashboard?tab=bookings",
    );

    return json({ id }, 201);
  } catch (error) {
    if (error instanceof BookingError) {
      return apiError(error.message, 409, { code: error.code });
    }
    return handleError(error);
  }
}
