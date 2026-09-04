import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

/**
 * Queue abstraction for notifications & emails.
 * Uses BullMQ + Redis in production (QUEUE_ENABLED=true).
 * Falls back to inline execution so the app runs without Redis in dev.
 */

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const queueEnabled = process.env.QUEUE_ENABLED === "true";

let connection: IORedis | null = null;

function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  }
  return connection;
}

export interface QueueJob {
  type: "email" | "notification";
  payload: Record<string, unknown>;
}

const notificationsQueue = queueEnabled
  ? new Queue<QueueJob>("talentbridge-jobs", { connection: getConnection() })
  : null;

export async function enqueue(job: QueueJob): Promise<void> {
  if (notificationsQueue) {
    await notificationsQueue.add(job.type, job);
  } else {
    // Inline fallback: process immediately (best-effort)
    try {
      const { processJob } = await import("@/workers/processor");
      await processJob(job);
    } catch (err) {
      console.error("[queue] inline processing failed", err);
    }
  }
}

export function startWorker(): Worker<QueueJob> | null {
  if (!queueEnabled || !notificationsQueue) return null;
  const worker = new Worker<QueueJob>(
    "talentbridge-jobs",
    async (job) => {
      const { processJob } = await import("@/workers/processor");
      await processJob(job.data);
    },
    { connection: getConnection() },
  );
  worker.on("failed", (job, err) => console.error(`[queue] job ${job?.id} failed`, err));
  return worker;
}
