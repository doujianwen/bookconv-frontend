// src/lib/auth.ts
// Server-side auth helper — resolves plan level and result/batch ownership.
// Works in Next.js App Router API routes and middleware.
// Supabase was removed; subscription state resolves from Redis only, and
// there is no server-side session source, so requests are treated as anonymous.

import { getRedisClient } from './redis';

const REDIS_SUB_KEY = 'sub:';

/**
 * Plan level resolved from Redis subscription records.
 */
export type PlanLevel = 'free' | 'pro' | 'api';

interface SubscriptionRecord {
  user_id: string;
  plan: PlanLevel;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * Extract the current user's ID.
 * Returns null — there is no server-side session source after Supabase removal,
 * so all requests are treated as anonymous.
 */
export async function getCurrentUserId(): Promise<string | null> {
  return null;
}

/**
 * Get the current user's plan level from Redis subscription records.
 * Returns 'free' if no subscription is found.
 */
export async function getUserPlanLevel(userId: string): Promise<PlanLevel> {
  try {
    const redis = getRedisClient();
    if (!redis.connected) {
      await redis.connect();
    }
    const subJson = await redis.get(REDIS_SUB_KEY + userId);
    if (subJson) {
      const record = JSON.parse(subJson) as SubscriptionRecord;
      if (record.status === 'active') {
        return record.plan || 'free';
      }
      if (record.status === 'canceled') {
        return 'free';
      }
    }
  } catch (err: any) {
    console.error('[auth] Failed to read subscription from Redis:', err.message);
  }

  return 'free';
}

/**
 * Check if a conversion result belongs to the requesting user.
 * Returns true if:
 * - No auth is configured (anonymous mode)
 * - The result has no userId (anonymous user created it)
 * - The result's userId matches the current user
 */
export async function canAccessResult(resultUserId?: string): Promise<boolean> {
  // If the result has no userId, anyone with the jobId can access (anonymous mode)
  if (!resultUserId) return true;

  const currentUserId = await getCurrentUserId();
  // If no current user is authenticated, deny access to user-owned results
  if (!currentUserId) return false;

  return currentUserId === resultUserId;
}

/**
 * Check if a batch belongs to the requesting user.
 */
export async function canAccessBatch(batchUserId?: string): Promise<boolean> {
  // If batch has no userId (anonymous), anyone can access it
  if (!batchUserId) return true;

  const currentUserId = await getCurrentUserId();
  // If no current user is authenticated, deny access to user-owned batches
  if (!currentUserId) return false;

  return currentUserId === batchUserId;
}
