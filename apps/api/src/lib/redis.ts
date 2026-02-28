import Redis from "ioredis";
import { Queue, Worker } from "bullmq";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

export const redis = new Redis(redisConnection);

// Queue instances
export const emailScanQueue = new Queue("email-scan", { connection: redisConnection });
export const breachScanQueue = new Queue("breach-scan", { connection: redisConnection });
export const weeklyReportQueue = new Queue("weekly-report", { connection: redisConnection });
export const securityScoreQueue = new Queue("security-score", { connection: redisConnection });
export const userActivityQueue = new Queue("user-activity", { connection: redisConnection });

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redis.on("connect", () => {
  console.log("Redis Client Connected");
});

export default redis;
