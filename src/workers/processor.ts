import { sendEmail } from "@/lib/mailer";
import type { QueueJob } from "@/lib/queue";

export async function processJob(job: QueueJob): Promise<void> {
  switch (job.type) {
    case "email": {
      const { to, subject, html } = job.payload as {
        to: string;
        subject: string;
        html: string;
      };
      if (!to) return;
      await sendEmail({ to, subject, html });
      break;
    }
    case "notification": {
      // In-app notifications are created synchronously by callers;
      // this job exists for fan-out (e.g. mobile push later).
      break;
    }
  }
}
