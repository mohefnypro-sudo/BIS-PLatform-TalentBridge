import { Prisma, type BookingStatus, type SessionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyBookingMentor, notifyBookingStudent } from "@/lib/notifications";

export class BookingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

export interface CreateBookingInput {
  studentProfileId: string;
  mentorProfileId: string;
  startsAt: Date;
  endsAt: Date;
  sessionLength: number;
  sessionType: SessionType;
  preSessionQuestions?: string | null;
  notes?: string | null;
  slotId?: string;
}

const ACTIVE_STATUSES: BookingStatus[] = ["PENDING", "APPROVED"];

/**
 * Create a booking atomically, protecting against overlapping-slot race
 * conditions. Two layers of defence:
 *
 *  1. Serializable isolation + `SELECT ... FOR UPDATE` on any rows in the
 *     conflicting range, so two simultaneous requests for the same window
 *     serialize and the second one observes the first.
 *  2. A unique index on AvailabilitySlot (mentorProfileId, startsAt) prevents
 *     duplicate slot rows at the storage layer.
 *
 * If `slotId` is provided the slot row itself is locked and atomically marked
 * as booked; otherwise the engine locks the overlapping booking window.
 */
export async function createBooking(input: CreateBookingInput): Promise<{ id: string }> {
  const now = new Date();
  const { studentProfileId, mentorProfileId, startsAt, endsAt, sessionLength, sessionType, preSessionQuestions, notes, slotId } = input;

  if (startsAt < now) {
    throw new BookingError("You cannot book a session in the past.", "PAST_TIME");
  }
  if (endsAt <= startsAt) {
    throw new BookingError("Session end time must be after its start time.", "INVALID_RANGE");
  }
  if (sessionLength <= 0) {
    throw new BookingError("Invalid session length.", "INVALID_LENGTH");
  }

  return prisma.$transaction(
    async (tx) => {
      const mentor = await tx.mentorProfile.findUnique({
        where: { id: mentorProfileId },
        include: { user: { select: { id: true, name: true } } },
      });
      if (!mentor) throw new BookingError("Mentor not found.", "MENTOR_NOT_FOUND");
      if (!mentor.calendarEnabled) throw new BookingError("This mentor is not accepting bookings.", "CALENDAR_DISABLED");

      const isSlotBooked = slotId
        ? await tx.availabilitySlot.findFirst({
            where: { id: slotId, mentorProfileId, isBooked: true },
            select: { id: true },
          })
        : null;
      if (isSlotBooked) {
        throw new BookingError("This time slot has already been taken.", "SLOT_TAKEN");
      }

      // -- Layer 1: lock the overlapping window -----------------------------
      const overlapping = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Booking"
        WHERE "mentorProfileId" = ${mentorProfileId}
          AND "status" IN ('PENDING', 'APPROVED')
          AND "scheduledFor" < ${endsAt}
          AND "endsAt" > ${startsAt}
        FOR UPDATE
      `;
      if (overlapping.length > 0) {
        throw new BookingError("This mentor is already booked in that time window.", "OVERLAP");
      }

      // Prevent the same student from double-booking overlapping windows
      const selfOverlap = await tx.booking.count({
        where: {
          studentId: studentProfileId,
          status: { in: ACTIVE_STATUSES },
          scheduledFor: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      });
      if (selfOverlap > 0) {
        throw new BookingError("You already have a session in that time window.", "SELF_OVERLAP");
      }

      // Daily booking cap for the mentor
      const dayStart = new Date(startsAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayCount = await tx.booking.count({
        where: {
          mentorProfileId,
          status: { in: ACTIVE_STATUSES },
          scheduledFor: { gte: dayStart, lt: dayEnd },
        },
      });
      if (dayCount >= mentor.maxBookingsPerDay) {
        throw new BookingError("This mentor has reached their daily booking limit.", "DAILY_LIMIT");
      }

      // -- Create booking (and consume the slot atomically if provided) ----
      const booking = await tx.booking.create({
        data: {
          studentId: studentProfileId,
          mentorProfileId,
          slotId,
          status: "PENDING",
          sessionType,
          sessionLength,
          scheduledFor: startsAt,
          endsAt,
          preSessionQuestions,
          notes,
        },
      });

      if (slotId) {
        const claim = await tx.availabilitySlot.updateMany({
          where: { id: slotId, mentorProfileId, isBooked: false },
          data: { isBooked: true, bookingId: booking.id },
        });
        if (claim.count !== 1) {
          throw new BookingError("This time slot was just taken by someone else.", "SLOT_RACE");
        }
      }

      return { id: booking.id };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 10000 },
  );
}

export interface BookingStatusInput {
  bookingId: string;
  actorUserId: string;
  status: BookingStatus;
  meetingLink?: string | null;
  mentorNotes?: string | null;
  studentFeedback?: string | null;
  studentRating?: number | null;
}

export async function updateBookingStatus(input: BookingStatusInput): Promise<void> {
  const { bookingId, actorUserId, status, meetingLink, mentorNotes, studentFeedback, studentRating } = input;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: { include: { user: { select: { id: true, name: true } } } },
      mentor: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!booking) throw new BookingError("Booking not found.", "NOT_FOUND");

  const isMentor = booking.mentor.user.id === actorUserId;
  const isStudent = booking.student.user.id === actorUserId;

  if (status === "APPROVED" && !isMentor) throw new BookingError("Only the mentor can approve bookings.", "FORBIDDEN");
  if (status === "DECLINED" && !isMentor) throw new BookingError("Only the mentor can decline bookings.", "FORBIDDEN");
  if (status === "COMPLETED" && !isMentor) throw new BookingError("Only the mentor can mark a session complete.", "FORBIDDEN");
  if (status === "CANCELLED" && !isStudent && !isMentor) throw new BookingError("Only the student or mentor can cancel.", "FORBIDDEN");
  if ((studentFeedback != null || studentRating != null) && !isStudent) throw new BookingError("Only the student can leave feedback.", "FORBIDDEN");
  if ((meetingLink != null || mentorNotes != null) && !isMentor) throw new BookingError("Only the mentor can add session details.", "FORBIDDEN");

  await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status,
        meetingLink: meetingLink ?? undefined,
        mentorNotes: mentorNotes ?? undefined,
        studentFeedback: studentFeedback ?? undefined,
        studentRating: studentRating ?? undefined,
      },
      select: { id: true, slotId: true },
    });

    // Free the slot when the booking is cancelled/declined
    if ((status === "CANCELLED" || status === "DECLINED") && updated.slotId) {
      await tx.availabilitySlot.updateMany({
        where: { id: updated.slotId, isBooked: true },
        data: { isBooked: false, bookingId: null },
      });
    }
  });

  const dashLink = "/dashboard?tab=bookings";
  switch (status) {
    case "APPROVED":
      await notifyBookingStudent(
        booking.id,
        "Session approved",
        `Your session with ${booking.mentor.user.name ?? "your mentor"} on ${booking.scheduledFor.toLocaleString()} has been approved.`,
        dashLink,
      );
      break;
    case "DECLINED":
      await notifyBookingStudent(
        booking.id,
        "Session declined",
        `Unfortunately your session request for ${booking.scheduledFor.toLocaleString()} was declined by the mentor.`,
        dashLink,
      );
      break;
    case "CANCELLED":
      await notifyBookingMentor(
        booking.id,
        "Session cancelled",
        `The session on ${booking.scheduledFor.toLocaleString()} has been cancelled.`,
        dashLink,
      );
      break;
    case "COMPLETED":
      await notifyBookingStudent(
        booking.id,
        "Session completed",
        `Great work! Your session on ${booking.scheduledFor.toLocaleString()} was completed. Leave feedback to help the mentor.`,
        dashLink,
      );
      break;
  }
}

/** Find conflicts for the UI (slot picker greys out taken windows). */
export async function findActiveRanges(mentorProfileId: string, from: Date, to: Date) {
  return prisma.booking.findMany({
    where: {
      mentorProfileId,
      status: { in: ACTIVE_STATUSES },
      scheduledFor: { lt: to },
      endsAt: { gt: from },
    },
    select: { scheduledFor: true, endsAt: true },
  });
}
