import { Worker } from "bullmq";
import { breachScanQueue } from "../lib/redis";
import { monitorBreaches } from "../services/breach-monitor";
import prisma from "../lib/db";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
};

const breachScanWorker = new Worker(
  "breach-scan",
  async (job) => {
    try {
      const { organizationId } = job.data;

      console.log(`Processing breach scan for organization: ${organizationId}`);

      await monitorBreaches(organizationId);

      job.progress(100);

      return { success: true };
    } catch (error) {
      console.error("Breach scan job error:", error);
      throw error;
    }
  },
  { connection: redisConnection }
);

breachScanWorker.on("completed", (job) => {
  console.log(`Breach scan job ${job.id} completed`);
});

breachScanWorker.on("failed", (job, err) => {
  console.error(`Breach scan job ${job?.id} failed:`, err);
});

export async function queueBreachScan(organizationId: string): Promise<void> {
  await breachScanQueue.add("scan", { organizationId });
}

export async function startBreachScanWorker(): Promise<void> {
  // Schedule weekly breach scans
  console.log("Breach scan worker started");

  // Run daily
  setInterval(async () => {
    const orgs = await prisma.organization.findMany({
      where: { subscriptionStatus: "active" },
    });

    for (const org of orgs) {
      await queueBreachScan(org.id);
    }
  }, 24 * 60 * 60 * 1000);
}

export default {
  start: startBreachScanWorker,
  queue: breachScanQueue,
};
