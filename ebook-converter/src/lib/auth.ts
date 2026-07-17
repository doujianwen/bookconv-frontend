// src/lib/auth.ts
// Server-side auth helper — extracts userId from Supabase session cookie.
// Designed to work in both Next.js App Router API routes and middleware.

import { createClientInner } from './supabase/server';

/**
 * Extract the current user's ID from the Supabase session.
 * Returns null if no session is found (anonymous user).
 *
 * In a future version, this should be integrated with a proper
 * auth middleware that validates JWT tokens server-side.
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
  if (!batchUserId) return true;
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return false;
  return currentUserId === batchUserId;
}
