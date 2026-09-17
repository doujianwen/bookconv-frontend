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

// NOTE ON PLAN FEATURES (2026-09-17):
// These strings are the commercial offer -- they render on /pricing and are the
// basis on which someone pays. Only list a benefit that the code actually
// enforces. Verified against the implementation:
//   file size    convert-handler.ts uses one flat MAX_FILE_SIZE_MB (10 in
//                production), with no plan branch and no user argument.
//   rate limit   /api/convert hard-codes the convertApi strategy (20 req/60s
//                per IP) for every plan alike.
//   priority     ConversionJobData.priority is declared but never assigned, so
//                no job is ever prioritised.
//   batch        genuinely gated by plan on /batch -- the one real Pro benefit.
// Removed on this date: 'Up to 50MB file size', 'Up to 100MB file size',
// 'Unlimited conversions', '5 conversions per hour', 'Priority queue'.
// Do not re-add them until the pipeline reads the plan (see docs/
// seo-geo-execution-plan-2026-09-17.md, risk R7).
export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    lemonSqueezyVariantId: '',
    name: 'Free',
    priceCents: 0,
    currency: 'USD',
    interval: 'one_time',
    features: [
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
      'Batch conversion',
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
      'Batch conversion',
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
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', LS_WEBHOOK_SECRET);
  const digest = hmac.update(payload, 'utf8').digest('hex');
  const sigBuf = Buffer.from(signature || '');
  const digBuf = Buffer.from(digest);
  // timingSafeEqual throws on length mismatch — return false (→ 401) instead of 500.
  if (sigBuf.length !== digBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, digBuf);
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
