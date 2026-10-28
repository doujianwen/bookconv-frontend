// Lemon Squeezy payment service -- plan definitions + helpers
import { createHmac, timingSafeEqual } from 'node:crypto';
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

// Offer baseline reviewed 2026-10-28: public-beta batch access is available
// without a paid plan. Batch uses the 4 MB multipart path; single-file direct
// upload supports 100 MB when enabled. Neither cap is a paid-plan benefit.
// Do not promise priority, higher quotas or future exclusive access as live.
export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    lemonSqueezyVariantId: '',
    name: 'Free',
    priceCents: 0,
    currency: 'USD',
    interval: 'one_time',
    features: [
      'Single-file direct upload up to 100 MB when enabled',
      'Batch conversion free during public beta (4 MB per file)',
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
      'Batch conversion (also free during public beta)',
      'All formats + special tools',
      'No watermark',
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
      'Batch conversion (also free during public beta)',
      'All formats + special tools',
      'No watermark',
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

/**
 * Normalize a Lemon Squeezy variant ID for comparison.
 * Env configs store the ID with a `v_` prefix (e.g. "v_1947491") because that
 * is what the checkout API expects, but the webhook payloads send the raw
 * integer ("1947491"). Strip the prefix on both sides so the lookup is robust
 * to either representation — otherwise a real subscription would never resolve
 * to its plan and the Pro gate would stay locked forever.
 */
function normalizeVariantId(v: string | number | undefined): string {
  if (v === undefined || v === null) return '';
  return String(v).replace(/^v_/i, '').trim();
}

/** Look up a plan by its Lemon Squeezy variant ID */
export function getPlanByVariantId(variantId: string | number | undefined): PlanConfig | undefined {
  if (!variantId) return undefined;
  const target = normalizeVariantId(variantId);
  if (!target) return undefined;
  return PLANS.find(
    (p) => p.id !== 'free' && normalizeVariantId(p.lemonSqueezyVariantId) === target
  );
}

export function formatPrice(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!LS_WEBHOOK_SECRET) return true;
  const hmac = createHmac('sha256', LS_WEBHOOK_SECRET);
  const digest = hmac.update(payload, 'utf8').digest('hex');
  const sigBuf = Buffer.from(signature || '');
  const digBuf = Buffer.from(digest);
  // timingSafeEqual throws on length mismatch — return false (→ 401) instead of 500.
  if (sigBuf.length !== digBuf.length) return false;
  return timingSafeEqual(sigBuf, digBuf);
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'unpaid';

// Lemon Squeezy does not guarantee a status on every event; an absent one
// falls through to 'unpaid' exactly as before.
export function mapSubscriptionStatus(lsStatus: string | undefined): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'active',
    paused: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    trialing: 'active',
  };
  return (lsStatus ? statusMap[lsStatus] : undefined) || 'unpaid';
}
