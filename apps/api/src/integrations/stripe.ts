import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function createCheckoutSession(
  customerId: string | undefined,
  priceId: string,
  metadata: Record<string, string>
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
    customer: customerId,
    metadata,
  });

  return session.id;
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/settings/billing`,
  });

  return session.url;
}

export async function createCustomer(email: string, name: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer.id;
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function updateSubscription(
  subscriptionId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0].id;

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: priceId,
      },
    ],
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.del(subscriptionId);
}

export function validateWebhookSignature(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  );
}
