import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        break;

      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('Invoice paid:', event.data.object);
        break;

      case 'invoice.payment_failed':
        console.log('Invoice payment failed:', event.data.object);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
