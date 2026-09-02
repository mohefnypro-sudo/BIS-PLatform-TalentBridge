import { apiError, handleError, json, requireUser } from "@/lib/api";
import { BookingError, updateBookingStatus } from "@/lib/booking";
import { bookingStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireUser();
  if (result.error) return result.error;
  const { user } = result.session;
  const { id } = await params;

  try {
    const body = bookingStatusSchema.parse(await req.json());

    await updateBookingStatus({
      bookingId: id,
      actorUserId: user.id,
      status: body.status,
      meetingLink: body.meetingLink,
      mentorNotes: body.mentorNotes,
      studentFeedback: body.studentFeedback,
      studentRating: body.studentRating,
    });

    return json({ ok: true });
  } catch (error) {
    if (error instanceof BookingError) return apiError(error.message, 409, { code: error.code });
    return handleError(error);
  }
}
