// src/lib/subscription.ts
// Subscription state management using Redis (fallback when Supabase is not configured).

import { getRedisClient } from './redis';
import { getPlanByVariantId } from './payments/service';

const SUBSCRIPTION_TTL_SECONDS = 30 * 24 * 3600; // 30 days

/** Helper: get or create Redis connection */
async function getRedis(): Promise<any> {
  const redis = getRedisClient();
  if (!redis.connected) {
    try { await redis.connect(); } catch { /* fall through */ }
  }
  return redis;
}

/** Save subscription status to Redis */
export async function saveSubscription(
  userId: string,
  status: string,
  variantId: string,
  endsAt?: number,
): Promise<void> {
  try {
    const redis = await getRedis();
    const key = `sub:${userId.toLowerCase()}`;
    const data = JSON.stringify({
      status,
      variantId,
      updatedAt: Date.now(),
      ...(endsAt ? { endsAt } : {}),
    });
    await redis.setex(key, SUBSCRIPTION_TTL_SECONDS, data);
  } catch (err: any) {
    console.error('[subscription] Failed to save to Redis:', err.message);
  }
}

/** Get subscription status from Redis */
export async function getSubscriptionStatus(
  userId: string,
): Promise<{ status: string; variantId: string; endsAt?: number } | null> {
  try {
    const redis = await getRedis();
    const data = await redis.get(`sub:${userId.toLowerCase()}`);
    if (!data) return null;
    return JSON.parse(data as string);
  } catch {
    return null;
  }
}

/** Check if user has active Pro subscription */
export async function hasProSubscription(userId: string): Promise<boolean> {
  const sub = await getSubscriptionStatus(userId);
  if (!sub || sub.status !== 'active') return false;
  if (sub.endsAt && Date.now() > sub.endsAt) return false;
  return true;
}

/** Remove subscription record (for cancellations) */
export async function removeSubscription(userId: string): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.del(`sub:${userId.toLowerCase()}`);
  } catch (err: any) {
    console.error('[subscription] Failed to remove from Redis:', err.message);
  }
}

/**
 * Resolve the plan level for a given email identity.
 * This is the canonical resolver used by gated surfaces (e.g. /batch).
 * Returns 'free' when there is no active subscription or the store is unreachable.
 */
export async function getPlanByEmail(
  email: string | null,
): Promise<'free' | 'pro' | 'api'> {
  if (!email) return 'free';
  const sub = await getSubscriptionStatus(email.toLowerCase());
  if (!sub || sub.status !== 'active') return 'free';
  if (sub.endsAt && Date.now() > sub.endsAt) return 'free';
  const plan = getPlanByVariantId(sub.variantId);
  if (!plan) return 'free';
  return plan.id === 'api' ? 'api' : 'pro';
}

/** Grant credits for one-time purchases */
export async function grantCredits(userId: string, amount: number = 1): Promise<number> {
  try {
    const redis = await getRedis();
    const key = `credits:${userId.toLowerCase()}`;
    const current = parseInt(await redis.get(key) || '0', 10);
    const newAmount = current + amount;
    await redis.set(key, String(newAmount));
    return newAmount;
  } catch (err: any) {
    console.error('[subscription] Failed to grant credits:', err.message);
    return 0;
  }
}