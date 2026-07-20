import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, mapSubscriptionStatus } from '@/lib/payments/service';
import { saveSubscription, getSubscriptionStatus, hasProSubscription, removeSubscription, grantCredits } from '@/lib/subscription';
import { loggers as log } from '@/lib/logger';

/**
 * Lemon Squeezy Webhook Handler
 * 
 * Subscribe at: https://app.lemonsqueezy.com/settings/webhook
 * Events: subscription_created, subscription_updated, subscription_cancelled, order_created
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-LemonSqueezy-Signature') || '';
    const payload = await request.text();
    
    if (!verifyWebhookSignature(payload, signature)) {
      log.webhook.error('Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(payload);
    const eventType = data.meta.event_name;
    const orderData = data.data;
    const attributes = orderData.attributes;

    log.webhook.info('Received event', { eventType, orderId: orderData.id });

    switch (eventType) {
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionEvent(eventType, attributes);
        break;

      case 'subscription_cancelled':
        await handleCancellation(attributes);
        break;

      case 'order_created':
        await handleOneTimePurchase(attributes);
        break;

      default:
        log.webhook.warn('Unhandled event type', { eventType });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    log.webhook.error('Webhook processing error', { error });
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 },
    );
  }
}

async function handleSubscriptionEvent(
  eventType: string,
  attrs: Record<string, any>,
): Promise<void> {
  const userId = attrs.customer_id?.toString();
  if (!userId) {
    log.webhook.warn('No userId in subscription event');
    return;
  }

  const status = mapSubscriptionStatus(attrs.status);
  const variantId = attrs.variant_id?.toString();
  const endsAt = attrs.renews_at ? Number(attrs.renews_at) * 1000 : undefined;

  await saveSubscription(userId, status, variantId, endsAt);
  log.webhook.info(`Subscription ${eventType}`, { userId, status });
}

async function handleCancellation(attrs: Record<string, any>): Promise<void> {
  const userId = attrs.customer_id?.toString();
  if (!userId) return;

  await removeSubscription(userId);
  log.webhook.info('Subscription canceled', { userId });
}

async function handleOneTimePurchase(attrs: Record<string, any>): Promise<void> {
  const userId = attrs.customer_id?.toString();
  if (!userId) return;

  const quantity = attrs.quantity || 1;
  await grantCredits(userId, quantity);
  log.webhook.info('One-time purchase', { userId, credits: quantity });
}