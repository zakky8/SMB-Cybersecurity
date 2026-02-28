import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { checkDomainReputation } from "../integrations/safe-browsing";

const addBlocklistSchema = z.object({
  domains: z.array(z.string()),
  category: z.enum(["malware", "phishing", "spam", "adware"]),
});

export default async function dnsRouter(fastify: FastifyInstance) {
  // Add domains to blocklist
  fastify.post<{ Body: z.infer<typeof addBlocklistSchema> }>(
    "/blocklist",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = addBlocklistSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const created = await Promise.all(
          body.domains.map((domain) =>
            prisma.dNSBlocklist.upsert({
              where: { organizationId_domain: { organizationId: orgId, domain } },
              update: {
                category: body.category,
              },
              create: {
                organizationId: orgId,
                domain,
                blocklistName: "ShieldDesk Blocklist",
                category: body.category,
              },
            })
          )
        );

        return reply.status(201).send({
          created: created.length,
          domains: created,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get blocklist
  fastify.get(
    "/blocklist",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { category } = request.query as { category?: string };

        const where: any = { organizationId: orgId };
        if (category) where.category = category;

        const entries = await prisma.dNSBlocklist.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });

        return reply.send(entries);
      } catch (error) {
        throw error;
      }
    }
  );

  // Remove from blocklist
  fastify.delete<{ Params: { id: string } }>(
    "/blocklist/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };

        await prisma.dNSBlocklist.delete({
          where: { id },
        });

        return reply.status(204).send();
      } catch (error) {
        throw error;
      }
    }
  );

  // Check domain reputation
  fastify.post<{ Body: { domain: string } }>(
    "/check",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { domain } = request.body as { domain: string };

        const reputation = await checkDomainReputation(domain);

        return reply.send(reputation);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get blocklist statistics
  fastify.get(
    "/stats/summary",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const [total, malware, phishing, spam, adware] = await Promise.all([
          prisma.dNSBlocklist.count({ where: { organizationId: orgId } }),
          prisma.dNSBlocklist.count({
            where: { organizationId: orgId, category: "malware" },
          }),
          prisma.dNSBlocklist.count({
            where: { organizationId: orgId, category: "phishing" },
          }),
          prisma.dNSBlocklist.count({
            where: { organizationId: orgId, category: "spam" },
          }),
          prisma.dNSBlocklist.count({
            where: { organizationId: orgId, category: "adware" },
          }),
        ]);

        return reply.send({
          total,
          byCategory: {
            malware,
            phishing,
            spam,
            adware,
          },
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Bulk check domains
  fastify.post<{ Body: { domains: string[] } }>(
    "/bulk-check",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { domains } = request.body as { domains: string[] };

        const results = await Promise.allSettled(
          domains.map((domain) => checkDomainReputation(domain))
        );

        const checked = results.map((result, index) => ({
          domain: domains[index],
          safe: result.status === "fulfilled" && result.value?.safe,
          result: result.status === "fulfilled" ? result.value : null,
        }));

        return reply.send(checked);
      } catch (error) {
        throw error;
      }
    }
  );
}
