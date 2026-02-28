import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";

const createSimulationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  templateId: z.string().optional(),
  scheduledFor: z.string().optional(),
});

export default async function simulationsRouter(fastify: FastifyInstance) {
  // Create simulation
  fastify.post<{ Body: z.infer<typeof createSimulationSchema> }>(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = createSimulationSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const simulation = await prisma.phishingSimulation.create({
          data: {
            organizationId: orgId,
            name: body.name,
            description: body.description,
            templateId: body.templateId,
            status: "draft",
            scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
          },
        });

        return reply.status(201).send(simulation);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get simulations
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { status } = request.query as { status?: string };

        const where: any = { organizationId: orgId };
        if (status) where.status = status;

        const simulations = await prisma.phishingSimulation.findMany({
          where,
          include: {
            results: true,
            _count: { select: { results: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        return reply.send(simulations);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get simulation by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const simulation = await prisma.phishingSimulation.findFirst({
          where: { id, organizationId: orgId },
          include: {
            results: { include: { employee: true } },
          },
        });

        if (!simulation) {
          return reply.status(404).send({ error: "Simulation not found" });
        }

        return reply.send(simulation);
      } catch (error) {
        throw error;
      }
    }
  );

  // Launch simulation
  fastify.post<{ Params: { id: string } }>(
    "/:id/launch",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const simulation = await prisma.phishingSimulation.update({
          where: { id },
          data: {
            status: "in_progress",
            startedAt: new Date(),
          },
        });

        return reply.send(simulation);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get simulation results
  fastify.get<{ Params: { id: string } }>(
    "/:id/results",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const results = await prisma.simulationResult.findMany({
          where: {
            simulationId: id,
            simulation: { organizationId: orgId },
          },
          include: { employee: true },
        });

        const stats = {
          total: results.length,
          clicked: results.filter((r) => r.linkClicked).length,
          submitted: results.filter((r) => r.credentialsSubmitted).length,
          reported: results.filter((r) => r.reportedAsPhishing).length,
        };

        return reply.send({
          results,
          stats,
          clickRate: stats.total > 0 ? (stats.clicked / stats.total) * 100 : 0,
          submissionRate:
            stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0,
          reportRate: stats.total > 0 ? (stats.reported / stats.total) * 100 : 0,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Record simulation interaction
  fastify.post<{
    Params: { id: string };
    Body: { employeeId: string; action: string };
  }>(
    "/:id/record",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const { employeeId, action } = request.body as {
          employeeId: string;
          action: string;
        };

        const result = await prisma.simulationResult.upsert({
          where: { simulationId_employeeId: { simulationId: id, employeeId } },
          update: {
            ...(action === "click" && {
              linkClicked: true,
              clickedAt: new Date(),
              result: "clicked",
            }),
            ...(action === "submit" && {
              credentialsSubmitted: true,
              submittedAt: new Date(),
              result: "submitted",
            }),
            ...(action === "report" && {
              reportedAsPhishing: true,
              reportedAt: new Date(),
              result: "reported",
            }),
          },
          create: {
            simulationId: id,
            employeeId,
            ...(action === "click" && {
              linkClicked: true,
              clickedAt: new Date(),
              result: "clicked",
            }),
            ...(action === "submit" && {
              credentialsSubmitted: true,
              submittedAt: new Date(),
              result: "submitted",
            }),
            ...(action === "report" && {
              reportedAsPhishing: true,
              reportedAt: new Date(),
              result: "reported",
            }),
          },
        });

        return reply.send(result);
      } catch (error) {
        throw error;
      }
    }
  );
}
