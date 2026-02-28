import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest, getAuthUser } from "../lib/auth";

const createOrgSchema = z.object({
  name: z.string().min(1),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.number().optional(),
});

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
  industry: z.string().optional(),
  size: z.number().optional(),
  billingEmail: z.string().email().optional(),
});

export default async function organizationsRouter(fastify: FastifyInstance) {
  // Create organization
  fastify.post<{ Body: z.infer<typeof createOrgSchema> }>(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = createOrgSchema.parse(request.body);
        const user = getAuthUser(request);

        const org = await prisma.organization.create({
          data: {
            name: body.name,
            website: body.website,
            industry: body.industry,
            size: body.size,
            clerkOrgId: `org_${Date.now()}`,
            members: {
              create: {
                clerkUserId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: "owner",
              },
            },
          },
          include: { members: true },
        });

        return reply.status(201).send(org);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get organization
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          include: {
            members: true,
            _count: {
              select: {
                devices: true,
                employees: true,
                threats: true,
              },
            },
          },
        });

        if (!org) {
          return reply.status(404).send({ error: "Organization not found" });
        }

        return reply.send(org);
      } catch (error) {
        throw error;
      }
    }
  );

  // Update organization
  fastify.patch<{ Body: z.infer<typeof updateOrgSchema> }>(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = updateOrgSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.update({
          where: { id: orgId },
          data: body,
        });

        return reply.send(org);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // List members
  fastify.get(
    "/members",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const members = await prisma.member.findMany({
          where: { organizationId: orgId },
        });

        return reply.send(members);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get subscription details
  fastify.get(
    "/subscription",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          select: {
            subscriptionPlan: true,
            subscriptionStatus: true,
            stripeCustomerId: true,
            trialEndsAt: true,
          },
        });

        if (!org) {
          return reply.status(404).send({ error: "Organization not found" });
        }

        return reply.send(org);
      } catch (error) {
        throw error;
      }
    }
  );
}
