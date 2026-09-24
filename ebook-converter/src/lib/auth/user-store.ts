// src/lib/auth/user-store.ts
// User store contract + in-memory implementation.
// Memory implementation is the dev/fallback store: users are lost on
// redeploy or across serverless instances. Set DATABASE_URL to persist
// users in Postgres (see user-store-postgres.ts).
import { scryptSync, randomBytes } from 'node:crypto';

const SALT_LEN = 16;
const KEY_LEN = 32;

export interface StoredUser {
  email: string;
  passwordHash: string; // base64 "salt:key" format from scrypt
}

export interface UserStore {
  registerUser(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  authenticate(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  getUser(email: string): Promise<StoredUser | null>;
  userExists(email: string): Promise<boolean>;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(password, salt, KEY_LEN);
  return Buffer.from(salt).toString('base64') + ':' + key.toString('base64');
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltB64, keyB64] = stored.split(':');
  if (!saltB64 || !keyB64) return false;
  const salt = Buffer.from(saltB64, 'base64');
  const expectedKey = scryptSync(password, salt, KEY_LEN);
  return expectedKey.toString('base64') === keyB64;
}

// Simple in-memory store (fallback when DATABASE_URL is not configured)
const users: Map<string, StoredUser> = new Map();

export const memoryUserStore: UserStore = {
  async registerUser(email, password) {
    const key = email.toLowerCase();
    if (users.has(key)) {
      return { success: false, error: 'Email already registered' };
    }
    users.set(key, { email: key, passwordHash: hashPassword(password) });
    return { success: true };
  },

  async authenticate(email, password) {
    const user = users.get(email.toLowerCase());
    if (!user) return { success: false, error: 'Invalid email or password' };
    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Invalid email or password' };
    }
    return { success: true };
  },

  async getUser(email) {
    return users.get(email.toLowerCase()) || null;
  },

  async userExists(email) {
    return users.has(email.toLowerCase());
  },
};
