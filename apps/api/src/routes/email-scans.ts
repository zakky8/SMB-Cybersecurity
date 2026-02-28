import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { emailScanQueue } from "../lib/redis";

const scanEmailSchema = z.object({
  messageId: z.string(),
  fromEmail: z.string().email(),
  toEmail: z.string().email(),
  subject: z.string(),
  receivedAt: z.string(),
});

export default async function emailScansRouter(fastify: FastifyInstance) {
  // Submit email for scanning
  fastify.post<{ Body: z.infer<typeof scanEmailSchema> }>(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = scanEmailSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const emailScan = await prisma.emailScan.create({
          data: {
            organizationId: orgId,
            messageId: body.messageId,
            fromEmail: body.fromEmail,
            toEmail: body.toEmail,
            subject: body.subject,
            receivedAt: new Date(body.receivedAt),
            scanStatus: "pending",
          },
        });

        // Queue for scanning
        await emailScanQueue.add("scan", {
          emailScanId: emailScan.id,
          organizationId: orgId,
        });

        return reply.status(201).send(emailScan);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get email scans
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { quarantined, threatType } = request.query as {
          quarantined?: string;
          threatType?: string;
        };

        const where: any = { organizationId: orgId };
        if (quarantined === "true") where.quarantined = true;
        if (threatType === "phishing") where.isPhishing = true;
        if (threatType === "spam") where.isSpam = true;
        if (threatType === "malware") where.isMalware = true;

        const scans = await prisma.emailScan.findMany({
          where,
          include: { scanResults: true },
          orderBy: { receivedAt: "desc" },
        });

        return reply.send(scans);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get email scan by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const scan = await prisma.emailScan.findFirst({
          where: { id, organizationId: orgId },
          include: { scanResults: true },
        });

        if (!scan) {
          return reply.status(404).send({ error: "Email scan not found" });
        }

        return reply.send(scan);
      } catch (error) {
        throw error;
      }
    }
  );

  // Quarantine email
  fastify.post<{ Params: { id: string } }>(
    "/:id/quarantine",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const scan = await prisma.emailScan.update({
          where: { id },
          data: {
            quarantined: true,
            quarantinedAt: new Date(),
          },
        });

        return reply.send(scan);
      } catch (error) {
        throw error;
      }
    }
  );

  // Restore email from quarantine
  fastify.post<{ Params: { id: string } }>(
    "/:id/restore",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const scan = await prisma.emailScan.update({
          where: { id },
          data: {
            quarantined: false,
            restoredAt: new Date(),
          },
        });

        return reply.send(scan);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get quarantine stats
  fastify.get(
    "/stats/quarantine",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [
          totalQuarantined,
          phishingCount,
          spamCount,
          malwareCount,
        ] = await Promise.all([
          prisma.emailScan.count({
            where: { organizationId: orgId, quarantined: true },
          }),
          prisma.emailScan.count({
            where: { organizationId: orgId, isPhishing: true },
          }),
          prisma.emailScan.count({
            where: { organizationId: orgId, isSpam: true },
          }),
          prisma.emailScan.count({
            where: { organizationId: orgId, isMalware: true },
          }),
        ]);

        return reply.send({
          totalQuarantined,
          phishingCount,
          spamCount,
          malwareCount,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Bulk actions on emails
  fastify.post<{ Body: { ids: string[]; action: string } }>(
    "/bulk/action",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { ids, action } = request.body as {
          ids: string[];
          action: string;
        };
        const orgId = getOrgIdFromRequest(request);

        if (action === "quarantine") {
          await prisma.emailScan.updateMany({
            where: { id: { in: ids }, organizationId: orgId },
            data: { quarantined: true, quarantinedAt: new Date() },
          });
        } else if (action === "restore") {
          await prisma.emailScan.updateMany({
            where: { id: { in: ids }, organizationId: orgId },
            data: { quarantined: false, restoredAt: new Date() },
          });
        }

        return reply.send({ affected: ids.length });
      } catch (error) {
        throw error;
      }
    }
  );
}
