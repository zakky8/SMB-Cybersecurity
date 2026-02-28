import { Worker } from "bullmq";
import { emailScanQueue } from "../lib/redis";
import { scanEmail } from "../services/email-scanner";
import prisma from "../lib/db";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
};

const emailScanWorker = new Worker(
  "email-scan",
  async (job) => {
    try {
      const { emailScanId, organizationId } = job.data;

      console.log(`Processing email scan: ${emailScanId}`);

      const result = await scanEmail(emailScanId);

      // Update job progress
      job.progress(100);

      return result;
    } catch (error) {
      console.error("Email scan job error:", error);
      throw error;
    }
  },
  { connection: redisConnection }
);

emailScanWorker.on("completed", (job) => {
  console.log(`Email scan job ${job.id} completed`);
});

emailScanWorker.on("failed", (job, err) => {
  console.error(`Email scan job ${job?.id} failed:`, err);
});

export async function queueEmailScan(
  emailScanId: string,
  organizationId: string
): Promise<void> {
  await emailScanQueue.add("scan", {
    emailScanId,
    organizationId,
  });
}

export async function startEmailScanWorker(): Promise<void> {
  console.log("Email scan worker started");
}

export default {
  start: startEmailScanWorker,
  queue: emailScanQueue,
};
