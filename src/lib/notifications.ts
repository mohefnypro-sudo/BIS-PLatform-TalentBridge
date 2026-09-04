import { prisma } from "@/lib/prisma";
import { enqueue } from "@/lib/queue";
import { emailLayout, sendEmail } from "@/lib/mailer";
import type { NotificationType } from "@prisma/client";

export interface NotifyInput {
  userId: string;
  type?: NotificationType;
  title: string;
  body?: string;
  link?: string;
  email?: { to: string; subject: string; html: string };
}

export async function notify({ userId, type = "SYSTEM", title, body, link, email }: NotifyInput): Promise<void> {
  await prisma.notification.create({ data: { userId, type, title, body, link } });
  await enqueue({ type: "notification", payload: { userId, title, body, link } });

  if (email) {
    await enqueue({
      type: "email",
      payload: { to: email.to ?? "", subject: email.subject, html: emailLayout(email.subject, email.html) },
    });
  }
}

export async function notifyBookingStudent(bookingId: string, title: string, body: string, link: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: { include: { user: { select: { id: true, email: true, name: true } } } },
      mentor: { include: { user: { select: { name: true } } } },
    },
  });
  if (!booking) return;
  const studentUser = booking.student.user;
  await notify({
    userId: studentUser.id,
    type: "BOOKING",
    title,
    body,
    link,
    email: {
      to: studentUser.email,
      subject: title,
      html: `<p>Hi ${studentUser.name},</p><p>${body}</p><p>Mentor: <strong>${booking.mentor.user.name}</strong></p><p>Scheduled: ${booking.scheduledFor.toLocaleString()}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${link}" style="background:#6366f1;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">Open TalentBridge</a></p>`,
    },
  });
}

export async function notifyBookingMentor(bookingId: string, title: string, body: string, link: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentor: { include: { user: { select: { id: true, email: true, name: true } } } },
      student: { include: { user: { select: { name: true } } } },
    },
  });
  if (!booking) return;
  const mentorUser = booking.mentor.user;
  await notify({
    userId: mentorUser.id,
    type: "BOOKING",
    title,
    body,
    link,
    email: {
      to: mentorUser.email,
      subject: title,
      html: `<p>Hi ${mentorUser.name},</p><p>${body}</p><p>Student: <strong>${booking.student.user.name}</strong></p><p>Scheduled: ${booking.scheduledFor.toLocaleString()}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${link}" style="background:#6366f1;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">Open TalentBridge</a></p>`,
    },
  });
}
