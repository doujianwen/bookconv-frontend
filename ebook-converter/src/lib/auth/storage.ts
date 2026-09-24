// src/lib/auth/storage.ts
// User store dispatcher. Public API is unchanged from the original in-memory
// implementation, so callers (login/register routes) need no modification.
//
// Backend selection:
//   - DATABASE_URL set  -> Postgres (persistent; works with Supabase/Neon/Vercel Postgres)
//   - otherwise         -> in-memory Map (dev/fallback; users are lost on redeploy)
import type { StoredUser, UserStore } from './user-store';
import { hashPassword, verifyPassword } from './user-store';
import { memoryUserStore } from './user-store';
import { postgresUserStore } from './user-store-postgres';

export type { StoredUser };
export { hashPassword, verifyPassword };

let store: UserStore | null = null;

function getStore(): UserStore {
  if (!store) {
    store = process.env.DATABASE_URL ? postgresUserStore : memoryUserStore;
  }
  return store;
}

export async function registerUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  return getStore().registerUser(email, password);
}

export async function authenticate(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  return getStore().authenticate(email, password);
}

export async function getUser(email: string): Promise<StoredUser | null> {
  return getStore().getUser(email);
}

export async function userExists(email: string): Promise<boolean> {
  return getStore().userExists(email);
}
