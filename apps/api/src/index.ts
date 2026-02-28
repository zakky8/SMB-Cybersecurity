import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";

// Import routes
import organizationsRouter from "./routes/organizations";
import employeesRouter from "./routes/employees";
import threatsRouter from "./routes/threats";
import devicesRouter from "./routes/devices";
import emailScansRouter from "./routes/email-scans";
import dashboardRouter from "./routes/dashboard";
import simulationsRouter from "./routes/simulations";
import trainingRouter from "./routes/training";
import billingRouter from "./routes/billing";
import breachRouter from "./routes/breach";
import dnsRouter from "./routes/dns";
import reportsRouter from "./routes/reports";

// Import jobs
import emailScanJob from "./jobs/email-scan.job";
import breachScanJob from "./jobs/breach-scan.job";
import weeklyReportJob from "./jobs/weekly-report.job";
import securityScoreJob from "./jobs/security-score.job";

const PORT = parseInt(process.env.API_PORT || "3001", 10);
const HOST = process.env.API_HOST || "0.0.0.0";

async function start(): Promise<void> {
  const app: FastifyInstance = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "debug",
    },
  });

  // Register plugins
  await app.register(helmet);
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "15 minutes",
  });

  await app.register(websocket);

  // Health check endpoint
  app.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register route handlers
  app.register(organizationsRouter, { prefix: "/api/v1/organizations" });
  app.register(employeesRouter, { prefix: "/api/v1/employees" });
  app.register(threatsRouter, { prefix: "/api/v1/threats" });
  app.register(devicesRouter, { prefix: "/api/v1/devices" });
  app.register(emailScansRouter, { prefix: "/api/v1/email-scans" });
  app.register(dashboardRouter, { prefix: "/api/v1/dashboard" });
  app.register(simulationsRouter, { prefix: "/api/v1/simulations" });
  app.register(trainingRouter, { prefix: "/api/v1/training" });
  app.register(billingRouter, { prefix: "/api/v1/billing" });
  app.register(breachRouter, { prefix: "/api/v1/breach" });
  app.register(dnsRouter, { prefix: "/api/v1/dns" });
  app.register(reportsRouter, { prefix: "/api/v1/reports" });

  // Global error handler
  app.setErrorHandler(async (error, request, reply) => {
    app.log.error(error);
    reply.status(500).send({
      error: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server listening on http://${HOST}:${PORT}`);

    // Initialize background jobs
    console.log("Initializing background jobs...");
    await emailScanJob.start();
    await breachScanJob.start();
    await weeklyReportJob.start();
    await securityScoreJob.start();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
