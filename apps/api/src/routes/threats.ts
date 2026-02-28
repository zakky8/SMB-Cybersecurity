import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";

const resolveThreatSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  reason: z.string().optional(),
});

export default async function threatsRouter(fastify: FastifyInstance) {
  // List threats
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { status, severity, deviceId } = request.query as {
          status?: string;
          severity?: string;
          deviceId?: string;
        };

        const where: any = { organizationId: orgId };
        if (status) where.status = status;
        if (severity) where.severity = severity;
        if (deviceId) where.deviceId = deviceId;

        const threats = await prisma.threat.findMany({
          where,
          include: { device: true },
          orderBy: { detectedAt: "desc" },
        });

        return reply.send(threats);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get threat by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const threat = await prisma.threat.findFirst({
          where: { id, organizationId: orgId },
          include: { device: true },
        });

        if (!threat) {
          return reply.status(404).send({ error: "Threat not found" });
        }

        return reply.send(threat);
      } catch (error) {
        throw error;
      }
    }
  );

  // Resolve threat
  fastify.patch<{ Params: { id: string }; Body: z.infer<typeof resolveThreatSchema> }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = resolveThreatSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const threat = await prisma.threat.update({
          where: { id },
          data: {
            status: body.status,
            ...(body.status === "dismissed" && {
              dismissedAt: new Date(),
              dismissReason: body.reason,
            }),
            ...(body.status === "resolved" && {
              resolvedAt: new Date(),
            }),
          },
        });

        return reply.send(threat);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get threats summary
  fastify.get(
    "/summary/stats",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [total, active, critical, high] = await Promise.all([
          prisma.threat.count({ where: { organizationId: orgId } }),
          prisma.threat.count({
            where: { organizationId: orgId, status: "active" },
          }),
          prisma.threat.count({
            where: { organizationId: orgId, severity: "critical" },
          }),
          prisma.threat.count({
            where: { organizationId: orgId, severity: "high" },
          }),
        ]);

        return reply.send({
          total,
          active,
          critical,
          high,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Get threats by severity
  fastify.get(
    "/severity/:level",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { level } = request.params as { level: string };

        const threats = await prisma.threat.findMany({
          where: {
            organizationId: orgId,
            severity: level,
          },
          include: { device: true },
        });

        return reply.send(threats);
      } catch (error) {
        throw error;
      }
    }
  );

  // Bulk resolve threats
  fastify.post<{ Body: { ids: string[]; status: string } }>(
    "/bulk/resolve",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { ids, status } = request.body as {
          ids: string[];
          status: string;
        };
        const orgId = getOrgIdFromRequest(request);

        const updated = await prisma.threat.updateMany({
          where: {
            id: { in: ids },
            organizationId: orgId,
          },
          data: {
            status,
            resolvedAt: new Date(),
          },
        });

        return reply.send({ updated: updated.count });
      } catch (error) {
        throw error;
      }
    }
  );
}
