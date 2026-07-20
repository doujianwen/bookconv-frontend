// src/lib/auth.ts
// Server-side auth helper — extracts userId from Supabase session cookie.
// Designed to work in both Next.js App Router API routes and middleware.

import { createClientInner } from './supabase/server';
import { getRedisClient } from './redis';

const REDIS_SUB_KEY = 'sub:';

/**
 * Plan level resolved from either Supabase or Redis fallback.
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
 * Extract the current user's ID from the Supabase session.
 * Returns null if no session is found (anonymous user).
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClientInner();
    const { data: { session } } = await (supabase as any).auth.getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // Supabase not configured or error — fall back to anonymous
  }
  return null;
}

/**
 * Get the current user's plan level.
 * Checks Supabase first, falls back to Redis subscription records.
 * Returns 'free' if no subscription is found.
 */
export async function getUserPlanLevel(userId: string): Promise<PlanLevel> {
  // Try Supabase first
  try {
    const supabase = await createClientInner();
    const supabaseAny = supabase as any;
    const { data, error } = await supabaseAny
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!error && data) {
      return (data as unknown as SubscriptionRecord).plan || 'free';
    }
  } catch {
    // Supabase not configured — fall through to Redis
  }

  // Fallback to Redis
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
