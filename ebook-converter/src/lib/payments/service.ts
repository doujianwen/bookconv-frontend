// Lemon Squeezy payment service -- plan definitions + helpers
const LS_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

export interface PlanConfig {
  id: string;
  lemonSqueezyVariantId: string;
  name: string;
  priceCents: number;
  currency: string;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
}

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    lemonSqueezyVariantId: '',
    name: 'Free',
    priceCents: 0,
    currency: 'USD',
    interval: 'one_time',
    features: [
      '5 conversions per hour',
      'Up to 10MB file size',
      'All standard formats',
      'No watermark',
    ],
  },
  {
    id: 'pro',
    lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID || '',
    name: 'Pro',
    priceCents: 500,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited conversions',
      'Up to 50MB file size',
      'All formats + special tools',
      'No watermark',
      'Batch conversion',
      'Priority queue',
    ],
  },
  {
    id: 'api',
    lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_API_MONTHLY_VARIANT_ID || '',
    name: 'API',
    priceCents: 2000,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited conversions',
      'Up to 100MB file size',
      'All formats + special tools',
      'No watermark',
      'Batch conversion',
      'Priority queue',
      'Full API access',
    ],
  },
];

export function getPlans(): Omit<PlanConfig, 'lemonSqueezyVariantId'>[] {
  return PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    priceCents: p.priceCents,
    currency: p.currency,
    interval: p.interval,
    features: p.features,
  }));
}

export function getPlanById(id: string): PlanConfig | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Look up a plan by its Lemon Squeezy variant ID */
export function getPlanByVariantId(variantId: string | undefined): PlanConfig | undefined {
  if (!variantId) return undefined;
  return PLANS.find(
    (p) => p.lemonSqueezyVariantId === variantId && p.id !== 'free'
  );
}

export function formatPrice(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!LS_WEBHOOK_SECRET) return true;
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', LS_WEBHOOK_SECRET);
  const digest = hmac.update(payload, 'utf8').digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'unpaid';

export function mapSubscriptionStatus(lsStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'active',
    paused: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    trialing: 'active',
  };
  return statusMap[lsStatus] || 'unpaid';
}
