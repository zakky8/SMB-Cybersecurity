import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { securityScoreQueue } from "../lib/redis";

const enrollDeviceSchema = z.object({
  deviceName: z.string(),
  deviceType: z.string(),
  osType: z.string(),
  osVersion: z.string().optional(),
});

const updateDeviceStatusSchema = z.object({
  agentStatus: z.enum(["online", "offline", "inactive"]).optional(),
  mfaEnabled: z.boolean().optional(),
  diskEncrypted: z.boolean().optional(),
  firewallEnabled: z.boolean().optional(),
  antivirusEnabled: z.boolean().optional(),
  antivirusLastUpdated: z.string().optional(),
});

export default async function devicesRouter(fastify: FastifyInstance) {
  // Enroll device (get enrollment token)
  fastify.post<{ Body: z.infer<typeof enrollDeviceSchema> }>(
    "/enroll",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = enrollDeviceSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const enrollmentToken = uuidv4();
        const device = await prisma.device.create({
          data: {
            ...body,
            organizationId: orgId,
            enrollmentToken,
          },
        });

        return reply.status(201).send({
          device,
          enrollmentToken,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get devices
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { status } = request.query as { status?: string };

        const where: any = { organizationId: orgId };
        if (status) where.agentStatus = status;

        const devices = await prisma.device.findMany({
          where,
          include: {
            scans: { orderBy: { startedAt: "desc" }, take: 1 },
            threats: { where: { status: "active" } },
          },
        });

        return reply.send(devices);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get device by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const device = await prisma.device.findFirst({
          where: { id, organizationId: orgId },
          include: {
            scans: { orderBy: { startedAt: "desc" } },
            threats: { orderBy: { detectedAt: "desc" } },
          },
        });

        if (!device) {
          return reply.status(404).send({ error: "Device not found" });
        }

        return reply.send(device);
      } catch (error) {
        throw error;
      }
    }
  );

  // Update device status
  fastify.patch<{ Params: { id: string }; Body: z.infer<typeof updateDeviceStatusSchema> }>(
    "/:id/status",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = updateDeviceStatusSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const device = await prisma.device.update({
          where: { id },
          data: {
            ...body,
            lastSeenAt: new Date(),
            enrollmentDate: new Date(),
          },
        });

        // Trigger security score recalculation
        await securityScoreQueue.add("recalculate", { organizationId: orgId });

        return reply.send(device);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Remote scan device
  fastify.post<{ Params: { id: string } }>(
    "/:id/scan",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const device = await prisma.device.findFirst({
          where: { id, organizationId: orgId },
        });

        if (!device) {
          return reply.status(404).send({ error: "Device not found" });
        }

        const scan = await prisma.securityScan.create({
          data: {
            deviceId: id,
            scanType: "quick",
            status: "pending",
          },
        });

        return reply.status(201).send(scan);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get device compliance
  fastify.get<{ Params: { id: string } }>(
    "/:id/compliance",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const device = await prisma.device.findFirst({
          where: { id, organizationId: orgId },
        });

        if (!device) {
          return reply.status(404).send({ error: "Device not found" });
        }

        const compliance = {
          diskEncrypted: device.diskEncrypted,
          mfaEnabled: device.mfaEnabled,
          firewallEnabled: device.firewallEnabled,
          antivirusEnabled: device.antivirusEnabled,
          agentInstalled: device.agentStatus !== "offline",
          overallScore: calculateDeviceScore(device),
        };

        return reply.send(compliance);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get devices summary
  fastify.get(
    "/summary/stats",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [total, online, encrypted, mfaEnabled] = await Promise.all([
          prisma.device.count({ where: { organizationId: orgId } }),
          prisma.device.count({
            where: { organizationId: orgId, agentStatus: "online" },
          }),
          prisma.device.count({
            where: { organizationId: orgId, diskEncrypted: true },
          }),
          prisma.device.count({
            where: { organizationId: orgId, mfaEnabled: true },
          }),
        ]);

        return reply.send({
          total,
          online,
          encrypted,
          mfaEnabled,
          encryptionRate: (encrypted / total) * 100,
          mfaRate: (mfaEnabled / total) * 100,
        });
      } catch (error) {
        throw error;
      }
    }
  );
}

function calculateDeviceScore(device: any): number {
  let score = 0;
  if (device.diskEncrypted) score += 20;
  if (device.mfaEnabled) score += 25;
  if (device.firewallEnabled) score += 20;
  if (device.antivirusEnabled) score += 20;
  if (device.agentStatus !== "offline") score += 15;
  return score;
}
