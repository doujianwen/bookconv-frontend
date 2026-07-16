import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, mapSubscriptionStatus } from '@/lib/payments/service';

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
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(payload);
    const eventType = data.meta.event_name;
    const orderData = data.data;
    const attributes = orderData.attributes;

    console.log('Received webhook event:', eventType, 'for order:', orderData.id);

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
        console.log('Unhandled event type:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionEvent(
  eventType: string,
  attrs: Record<string, any>
): Promise<void> {
  const userId = attrs.customer_id?.toString();
  const status = mapSubscriptionStatus(attrs.status);
  const variantId = attrs.variant_id?.toString();
  
  // TODO: Update user subscription in database (Supabase)
}

async function handleCancellation(attrs: Record<string, any>): Promise<void> {
  const userId = attrs.customer_id?.toString();
  // TODO: Deactivate subscription in database
}

async function handleOneTimePurchase(attrs: Record<string, any>): Promise<void> {
  const userId = attrs.customer_id?.toString();
  // TODO: Grant credits or unlock features
}
