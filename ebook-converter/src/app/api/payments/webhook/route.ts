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

/**
 * Resolve the internal user identity from a Lemon Squeezy webhook payload.
 * The app's identity key is the email (it is what the session JWT carries and
 * what the gate resolves against). We echo the email through checkout
 * custom_data, so it comes back verbatim on the webhook. Fall back to nothing —
 * if we can't tie the event to an email we must NOT silently key it by
 * Lemon Squeezy's customer_id, or the user will never see their plan.
 */
function resolveUserEmail(attrs: Record<string, any>): string | null {
  const email = attrs?.custom_data?.email?.toString().trim().toLowerCase();
  return email || null;
}

async function handleSubscriptionEvent(
  eventType: string,
  attrs: Record<string, any>,
): Promise<void> {
  const email = resolveUserEmail(attrs);
  if (!email) {
    log.webhook.warn('Subscription event has no resolvable email; skipping', {
      customer_id: attrs.customer_id,
    });
    return;
  }

  const status = mapSubscriptionStatus(attrs.status);
  const variantId = attrs.variant_id?.toString();
  const endsAt = attrs.renews_at ? Number(attrs.renews_at) * 1000 : undefined;

  await saveSubscription(email, status, variantId, endsAt);
  log.webhook.info(`Subscription ${eventType}`, { email, status });
}

async function handleCancellation(attrs: Record<string, any>): Promise<void> {
  const email = resolveUserEmail(attrs);
  if (!email) {
    log.webhook.warn('Cancellation has no resolvable email; skipping', {
      customer_id: attrs.customer_id,
    });
    return;
  }

  await removeSubscription(email);
  log.webhook.info('Subscription canceled', { email });
}

async function handleOneTimePurchase(attrs: Record<string, any>): Promise<void> {
  const email = resolveUserEmail(attrs);
  if (!email) {
    log.webhook.warn('One-time purchase has no resolvable email; skipping', {
      customer_id: attrs.customer_id,
    });
    return;
  }

  const quantity = attrs.quantity || 1;
  await grantCredits(email, quantity);
  log.webhook.info('One-time purchase', { email, credits: quantity });
}