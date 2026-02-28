import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { sendEmail } from "../lib/email";

const createModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string(),
  contentType: z.enum(["article", "video", "quiz"]),
  duration: z.number().positive(),
});

const recordProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  score: z.number().optional(),
});

export default async function trainingRouter(fastify: FastifyInstance) {
  // Create training module
  fastify.post<{ Body: z.infer<typeof createModuleSchema> }>(
    "/modules",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = createModuleSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const module = await prisma.trainingModule.create({
          data: {
            organizationId: orgId,
            ...body,
            status: "published",
          },
        });

        return reply.status(201).send(module);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get training modules
  fastify.get(
    "/modules",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const modules = await prisma.trainingModule.findMany({
          where: { organizationId: orgId },
          include: { _count: { select: { progress: true } } },
        });

        return reply.send(modules);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get module by ID
  fastify.get<{ Params: { id: string } }>(
    "/modules/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const module = await prisma.trainingModule.findFirst({
          where: { id, organizationId: orgId },
          include: { progress: true },
        });

        if (!module) {
          return reply.status(404).send({ error: "Module not found" });
        }

        return reply.send(module);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get employee training progress
  fastify.get<{ Params: { employeeId: string } }>(
    "/progress/:employeeId",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { employeeId } = request.params as { employeeId: string };

        const progress = await prisma.trainingProgress.findMany({
          where: {
            employeeId,
            module: { organizationId: orgId },
          },
          include: { module: true },
        });

        const stats = {
          total: progress.length,
          completed: progress.filter((p) => p.status === "completed").length,
          inProgress: progress.filter((p) => p.status === "in_progress").length,
        };

        return reply.send({
          progress,
          stats,
          completionRate:
            stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Record training progress
  fastify.post<{
    Params: { moduleId: string; employeeId: string };
    Body: z.infer<typeof recordProgressSchema>;
  }>(
    "/modules/:moduleId/employees/:employeeId",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = recordProgressSchema.parse(request.body);
        const { moduleId, employeeId } = request.params as {
          moduleId: string;
          employeeId: string;
        };

        const progress = await prisma.trainingProgress.upsert({
          where: { moduleId_employeeId: { moduleId, employeeId } },
          update: {
            status: body.status,
            score: body.score,
            completedAt: body.status === "completed" ? new Date() : null,
            startedAt: body.status === "in_progress" ? new Date() : null,
          },
          create: {
            moduleId,
            employeeId,
            status: body.status,
            score: body.score,
            completedAt: body.status === "completed" ? new Date() : null,
            startedAt: body.status === "in_progress" ? new Date() : null,
          },
          include: { module: true, employee: true },
        });

        return reply.send(progress);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Send training reminder
  fastify.post<{ Body: { employeeIds: string[] } }>(
    "/remind",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { employeeIds } = request.body as { employeeIds: string[] };
        const orgId = getOrgIdFromRequest(request);

        const employees = await prisma.employee.findMany({
          where: { id: { in: employeeIds } },
          include: {
            trainingProgress: {
              where: { status: { not: "completed" } },
              include: { module: true },
            },
          },
        });

        for (const employee of employees) {
          if (employee.trainingProgress.length > 0) {
            await sendEmail(
              employee.email,
              "trainingReminder",
              {
                firstName: employee.firstName,
                modules: employee.trainingProgress.map((p) => ({
                  title: p.module.title,
                  duration: p.module.duration,
                })),
                trainingLink: `${process.env.FRONTEND_URL}/training`,
              }
            ).catch((err) =>
              console.error(`Failed to send reminder to ${employee.email}:`, err)
            );
          }
        }

        return reply.send({
          sentTo: employees.length,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Get training stats
  fastify.get(
    "/stats/summary",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [totalProgress, completed, inProgress, notStarted] =
          await Promise.all([
            prisma.trainingProgress.count({
              where: { module: { organizationId: orgId } },
            }),
            prisma.trainingProgress.count({
              where: {
                module: { organizationId: orgId },
                status: "completed",
              },
            }),
            prisma.trainingProgress.count({
              where: {
                module: { organizationId: orgId },
                status: "in_progress",
              },
            }),
            prisma.trainingProgress.count({
              where: {
                module: { organizationId: orgId },
                status: "not_started",
              },
            }),
          ]);

        return reply.send({
          total: totalProgress,
          completed,
          inProgress,
          notStarted,
          completionRate: totalProgress > 0 ? (completed / totalProgress) * 100 : 0,
        });
      } catch (error) {
        throw error;
      }
    }
  );
}
