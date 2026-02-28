import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { checkBreaches } from "../integrations/hibp";
import { sendEmail } from "../lib/email";

export default async function breachRouter(fastify: FastifyInstance) {
  // Get breach alerts
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const breaches = await prisma.breachAlert.findMany({
          where: { organizationId: orgId },
          include: { affectedBreaches: true },
          orderBy: { detectedAt: "desc" },
        });

        return reply.send(breaches);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get breach by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const breach = await prisma.breachAlert.findFirst({
          where: { id, organizationId: orgId },
          include: { affectedBreaches: { include: { employee: true } } },
        });

        if (!breach) {
          return reply.status(404).send({ error: "Breach alert not found" });
        }

        return reply.send(breach);
      } catch (error) {
        throw error;
      }
    }
  );

  // Scan organization for breaches
  fastify.post(
    "/scan",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const employees = await prisma.employee.findMany({
          where: { organizationId: orgId, status: "active" },
        });

        const breachesFound: any[] = [];

        for (const employee of employees) {
          const breaches = await checkBreaches(employee.email);
          if (breaches && breaches.length > 0) {
            breachesFound.push({
              employee,
              breaches,
            });
          }
        }

        return reply.send({
          scanned: employees.length,
          breachesFound: breachesFound.length,
          details: breachesFound,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Check specific employee for breaches
  fastify.post<{ Params: { employeeId: string } }>(
    "/check/:employeeId",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { employeeId } = request.params as { employeeId: string };

        const employee = await prisma.employee.findFirst({
          where: { id: employeeId, organizationId: orgId },
        });

        if (!employee) {
          return reply.status(404).send({ error: "Employee not found" });
        }

        const breaches = await checkBreaches(employee.email);

        return reply.send({
          employee,
          breaches: breaches || [],
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Get breach statistics
  fastify.get(
    "/stats/summary",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [totalBreaches, affectedEmployees, criticalBreaches] =
          await Promise.all([
            prisma.breachAlert.count({
              where: { organizationId: orgId },
            }),
            prisma.breachRecord.count({
              where: { breachAlert: { organizationId: orgId } },
            }),
            prisma.breachAlert.count({
              where: { organizationId: orgId, severity: "critical" },
            }),
          ]);

        return reply.send({
          totalBreaches,
          affectedEmployees,
          criticalBreaches,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Send breach notification
  fastify.post<{ Body: { breachAlertId: string } }>(
    "/notify",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { breachAlertId } = request.body as { breachAlertId: string };
        const orgId = getOrgIdFromRequest(request);

        const breach = await prisma.breachAlert.findFirst({
          where: { id: breachAlertId, organizationId: orgId },
          include: { affectedBreaches: { include: { employee: true } } },
        });

        if (!breach) {
          return reply.status(404).send({ error: "Breach alert not found" });
        }

        let notified = 0;
        for (const record of breach.affectedBreaches) {
          await sendEmail(record.employee.email, "passwordBreach", {
            firstName: record.employee.firstName,
            resetLink: `${process.env.FRONTEND_URL}/reset-password`,
          }).catch((err) => console.error("Failed to send breach notification:", err));
          notified++;
        }

        await prisma.breachAlert.update({
          where: { id: breachAlertId },
          data: { alertSent: true },
        });

        return reply.send({
          notified,
        });
      } catch (error) {
        throw error;
      }
    }
  );
}
