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
import { weeklyReportWorker, scheduleWeeklyReports } from "./jobs/weekly-report.job";
import { simulationWorker } from "./jobs/simulation.job";

const PORT = parseInt(process.env.API_PORT || "4000", 10);
const HOST = process.env.API_HOST || "0.0.0.0";

async function start(): Promise<void> {
  const app: FastifyInstance = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  });

  // Security plugins
  await app.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  });

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
  app.get("/health", async (_request: FastifyRequest, _reply: FastifyReply) => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    };
  });

  // Register route handlers
  app.register(organizationsRouter, { prefix: "/api/v1/organizations" });
  app.register(employeesRouter,     { prefix: "/api/v1/employees" });
  app.register(threatsRouter,       { prefix: "/api/v1/threats" });
  app.register(devicesRouter,       { prefix: "/api/v1/devices" });
  app.register(emailScansRouter,    { prefix: "/api/v1/email-scans" });
  app.register(dashboardRouter,     { prefix: "/api/v1/dashboard" });
  app.register(simulationsRouter,   { prefix: "/api/v1/simulations" });
  app.register(trainingRouter,      { prefix: "/api/v1/training" });
  app.register(billingRouter,       { prefix: "/api/v1/billing" });
  app.register(breachRouter,        { prefix: "/api/v1/breach" });
  app.register(dnsRouter,           { prefix: "/api/v1/dns" });
  app.register(reportsRouter,       { prefix: "/api/v1/reports" });

  // Global error handler
  app.setErrorHandler(async (error, _request, reply) => {
    app.log.error(error);
    const statusCode = (error as any).statusCode ?? 500;
    reply.status(statusCode).send({
      error: error.message,
      code: (error as any).code ?? "INTERNAL_SERVER_ERROR",
    });
  });

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://${HOST}:${PORT}`);

    // Start background job workers
    app.log.info("Starting background job workers...");
    await emailScanJob.start();
    await breachScanJob.start();

    // Weekly report worker is already running (imported above)
    app.log.info(`Weekly report worker state: ${weeklyReportWorker.isRunning()}`);
    app.log.info(`Simulation worker state: ${simulationWorker.isRunning()}`);

    // Schedule recurring weekly reports
    if (process.env.NODE_ENV === "production") {
      await scheduleWeeklyReports();
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
