import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { calculateSecurityScore } from "../services/security-score";

export default async function dashboardRouter(fastify: FastifyInstance) {
  // Get dashboard overview
  fastify.get(
    "/overview",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [
          org,
          activeThreats,
          devicesOnline,
          totalDevices,
          trainingCompleted,
          totalEmployees,
          securityScore,
        ] = await Promise.all([
          prisma.organization.findUnique({ where: { id: orgId } }),
          prisma.threat.count({
            where: { organizationId: orgId, status: "active" },
          }),
          prisma.device.count({
            where: { organizationId: orgId, agentStatus: "online" },
          }),
          prisma.device.count({ where: { organizationId: orgId } }),
          prisma.trainingProgress.count({
            where: { module: { organizationId: orgId }, status: "completed" },
          }),
          prisma.employee.count({ where: { organizationId: orgId } }),
          prisma.securityScore.findFirst({
            where: { organizationId: orgId },
            orderBy: { calculatedAt: "desc" },
          }),
        ]);

        return reply.send({
          organization: org,
          threats: activeThreats,
          deviceStatus: {
            online: devicesOnline,
            total: totalDevices,
            onlineRate: totalDevices > 0 ? (devicesOnline / totalDevices) * 100 : 0,
          },
          training: {
            completed: trainingCompleted,
            total: totalEmployees,
            completionRate:
              totalEmployees > 0 ? (trainingCompleted / totalEmployees) * 100 : 0,
          },
          securityScore: securityScore?.totalScore || 0,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Get security score details
  fastify.get(
    "/security-score",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const score = await calculateSecurityScore(orgId);

        return reply.send(score);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get threat trends
  fastify.get(
    "/threats/trends",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const threats = await prisma.threat.findMany({
          where: {
            organizationId: orgId,
            detectedAt: { gte: thirtyDaysAgo },
          },
          orderBy: { detectedAt: "asc" },
        });

        // Group by day
        const grouped: { [key: string]: number } = {};
        threats.forEach((threat) => {
          const date = threat.detectedAt.toISOString().split("T")[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });

        return reply.send(grouped);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get device compliance
  fastify.get(
    "/compliance/devices",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [
          totalDevices,
          encryptedDevices,
          mfaEnabled,
          firewallEnabled,
          antivirusEnabled,
        ] = await Promise.all([
          prisma.device.count({ where: { organizationId: orgId } }),
          prisma.device.count({
            where: { organizationId: orgId, diskEncrypted: true },
          }),
          prisma.device.count({ where: { organizationId: orgId, mfaEnabled: true } }),
          prisma.device.count({
            where: { organizationId: orgId, firewallEnabled: true },
          }),
          prisma.device.count({
            where: { organizationId: orgId, antivirusEnabled: true },
          }),
        ]);

        return reply.send({
          total: totalDevices,
          encryption: {
            count: encryptedDevices,
            percentage: totalDevices > 0 ? (encryptedDevices / totalDevices) * 100 : 0,
          },
          mfa: {
            count: mfaEnabled,
            percentage: totalDevices > 0 ? (mfaEnabled / totalDevices) * 100 : 0,
          },
          firewall: {
            count: firewallEnabled,
            percentage: totalDevices > 0 ? (firewallEnabled / totalDevices) * 100 : 0,
          },
          antivirus: {
            count: antivirusEnabled,
            percentage: totalDevices > 0 ? (antivirusEnabled / totalDevices) * 100 : 0,
          },
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Get recent activity
  fastify.get(
    "/activity/recent",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const activities = await prisma.auditLog.findMany({
          where: { organizationId: orgId },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        return reply.send(activities);
      } catch (error) {
        throw error;
      }
    }
  );
}
