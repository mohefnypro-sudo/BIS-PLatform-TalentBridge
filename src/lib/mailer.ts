import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { Resend } from "resend";

const driver = process.env.EMAIL_DRIVER ?? "log";
const from = process.env.EMAIL_FROM ?? "TalentBridge <no-reply@talentbridge.edu>";

let transporter: Transporter | null = null;
let resend: Resend | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
}

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailInput): Promise<void> {
  switch (driver) {
    case "smtp": {
      await getTransporter().sendMail({ from, to, subject, html, text });
      break;
    }
    case "resend": {
      const { error } = await getResend().emails.send({ from, to, subject, html });
      if (error) throw new Error(error.message);
      break;
    }
    default: {
      console.log(`\n[mailer:log] to=${to} subject="${subject}"\n${html}\n`);
    }
  }
}

export function emailLayout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#f6f7fb;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="padding:24px 32px;background:linear-gradient(135deg,#6366f1,#a855f7);">
        <span style="color:#ffffff;font-weight:700;font-size:18px;letter-spacing:.5px;">TalentBridge</span>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:16px 32px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;">
        You received this email from TalentBridge. Reply with "stop" to unsubscribe.
      </div>
    </div>
  </div>`;
}
