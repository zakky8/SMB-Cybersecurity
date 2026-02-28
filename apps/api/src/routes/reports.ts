import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { generatePDFReport } from "../services/report-generator";
import { sendEmail } from "../lib/email";

export default async function reportsRouter(fastify: FastifyInstance) {
  // Generate report
  fastify.post<{ Body: { reportType: string } }>(
    "/generate",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { reportType } = request.body as { reportType: string };
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.findUnique({
          where: { id: orgId },
        });

        if (!org) {
          return reply.status(404).send({ error: "Organization not found" });
        }

        // Gather statistics
        const [
          totalScore,
          mfaCompliance,
          deviceCompliance,
          trainingCompletion,
          simulationResults,
          breachRisk,
          threatCount,
          deviceCount,
        ] = await Promise.all([
          prisma.securityScore
            .findFirst({
              where: { organizationId: orgId },
              orderBy: { calculatedAt: "desc" },
            })
            .then((s) => s?.totalScore || 0),
          prisma.device
            .count({ where: { organizationId: orgId, mfaEnabled: true } })
            .then(
              (count) =>
                ((count /
                  (prisma.device.count({
                    where: { organizationId: orgId },
                  }) as any)) *
                  100) as number
            ),
          prisma.device
            .count({
              where: {
                organizationId: orgId,
                diskEncrypted: true,
                firewallEnabled: true,
              },
            })
            .then((count) => (count / 100) * 100),
          prisma.trainingProgress
            .count({
              where: {
                module: { organizationId: orgId },
                status: "completed",
              },
            })
            .then(
              (count) =>
                ((count /
                  (prisma.trainingProgress.count({
                    where: { module: { organizationId: orgId } },
                  }) as any)) *
                  100) as number
            ),
          prisma.simulationResult
            .count({
              where: {
                simulation: { organizationId: orgId },
                result: "reported",
              },
            })
            .then((count) => (count / 100) * 100),
          prisma.breachAlert.count({ where: { organizationId: orgId } }),
          prisma.threat.count({ where: { organizationId: orgId } }),
          prisma.device.count({ where: { organizationId: orgId } }),
        ]);

        const pdfUrl = await generatePDFReport({
          organizationName: org.name,
          reportType,
          totalScore,
          mfaCompliance,
          deviceCompliance,
          trainingCompletion,
          simulationResults,
          breachRisk,
          threatCount,
          deviceCount,
        });

        const report = await prisma.securityReport.create({
          data: {
            organizationId: orgId,
            reportType,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            totalScore,
            mfaCompliance,
            deviceCompliance,
            trainingCompletion,
            simulationResults,
            breachRisk,
            threats: threatCount,
            devicesScanned: deviceCount,
            pdfUrl,
          },
        });

        return reply.status(201).send(report);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get reports
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const reports = await prisma.securityReport.findMany({
          where: { organizationId: orgId },
          orderBy: { createdAt: "desc" },
        });

        return reply.send(reports);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get report by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const report = await prisma.securityReport.findFirst({
          where: { id, organizationId: orgId },
        });

        if (!report) {
          return reply.status(404).send({ error: "Report not found" });
        }

        return reply.send(report);
      } catch (error) {
        throw error;
      }
    }
  );

  // Download report PDF
  fastify.get<{ Params: { id: string } }>(
    "/:id/download",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const report = await prisma.securityReport.findFirst({
          where: { id, organizationId: orgId },
        });

        if (!report || !report.pdfUrl) {
          return reply.status(404).send({ error: "Report PDF not found" });
        }

        return reply.redirect(report.pdfUrl);
      } catch (error) {
        throw error;
      }
    }
  );

  // Email report
  fastify.post<{ Params: { id: string }; Body: { emails: string[] } }>(
    "/:id/email",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const { emails } = request.body as { emails: string[] };
        const orgId = getOrgIdFromRequest(request);

        const report = await prisma.securityReport.findFirst({
          where: { id, organizationId: orgId },
        });

        if (!report) {
          return reply.status(404).send({ error: "Report not found" });
        }

        for (const email of emails) {
          await sendEmail(email, "weeklyReport", {
            adminName: "Team",
            securityScore: Math.round(report.totalScore),
            threatsCount: report.threats,
            devicesScanned: report.devicesScanned,
            trainingCompletion: Math.round(report.trainingCompletion),
            reportLink: `${process.env.FRONTEND_URL}/reports/${id}`,
          }).catch((err) => console.error("Failed to send report email:", err));
        }

        return reply.send({
          emailedTo: emails.length,
        });
      } catch (error) {
        throw error;
      }
    }
  );
}
