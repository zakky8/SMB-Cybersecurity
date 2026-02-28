import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import Stripe from "stripe";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const checkoutSchema = z.object({
  plan: z.enum(["starter", "professional", "enterprise"]),
});

export default async function billingRouter(fastify: FastifyInstance) {
  // Create checkout session
  fastify.post<{ Body: z.infer<typeof checkoutSchema> }>(
    "/checkout",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = checkoutSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.findUnique({
          where: { id: orgId },
        });

        if (!org) {
          return reply.status(404).send({ error: "Organization not found" });
        }

        const priceMap: { [key: string]: string } = {
          starter: process.env.STRIPE_PRICE_STARTER || "",
          professional: process.env.STRIPE_PRICE_PROFESSIONAL || "",
          enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
        };

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceMap[body.plan],
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${process.env.FRONTEND_URL}/billing/success`,
          cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
          customer_email: org.billingEmail || "billing@example.com",
          metadata: {
            organizationId: orgId,
            plan: body.plan,
          },
        });

        return reply.send({
          sessionId: session.id,
          url: session.url,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get billing portal
  fastify.post(
    "/portal",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.findUnique({
          where: { id: orgId },
        });

        if (!org || !org.stripeCustomerId) {
          return reply.status(404).send({ error: "Billing not configured" });
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: org.stripeCustomerId,
          return_url: `${process.env.FRONTEND_URL}/settings/billing`,
        });

        return reply.send({
          url: session.url,
        });
      } catch (error) {
        throw error;
      }
    }
  );

  // Handle Stripe webhook
  fastify.post("/webhook", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sig = request.headers["stripe-signature"] as string;
      const body = request.body as string | Buffer;

      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const orgId = (session.metadata?.organizationId as string) || "";
          const plan = (session.metadata?.plan as string) || "";

          if (session.customer) {
            await prisma.organization.update({
              where: { id: orgId },
              data: {
                stripeCustomerId: session.customer as string,
                subscriptionStatus: "active",
                subscriptionPlan: plan,
              },
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const items = subscription.items.data;
          // Handle subscription updates
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          // Handle cancellation
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          // Handle failed payment
          break;
        }
      }

      return reply.status(200).send({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      return reply.status(400).send({ error: "Webhook error" });
    }
  });

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
            trialEndsAt: true,
            billingEmail: true,
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

  // Update subscription plan
  fastify.patch<{ Body: { plan: string } }>(
    "/subscription/plan",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { plan } = request.body as { plan: string };
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.update({
          where: { id: orgId },
          data: { subscriptionPlan: plan },
        });

        return reply.send(org);
      } catch (error) {
        throw error;
      }
    }
  );
}
