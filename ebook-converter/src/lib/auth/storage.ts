// src/lib/auth/storage.ts
// In-memory user store with bcrypt-style password hashing.
// In production, replace with Supabase/PostgreSQL.
import { scryptSync, randomBytes } from 'node:crypto';

const SALT_LEN = 16;
const KEY_LEN = 32;

export interface StoredUser {
  email: string;
  passwordHash: string; // base64 "salt:key" format from scrypt
}

// Simple in-memory store (replace with DB in production)
const users: Map<string, StoredUser> = new Map();

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(password, salt, KEY_LEN);
  return Buffer.from(salt).toString('base64') + ':' + key.toString('base64');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, keyB64] = stored.split(':');
  if (!saltB64 || !keyB64) return false;
  const salt = Buffer.from(saltB64, 'base64');
  const expectedKey = scryptSync(password, salt, KEY_LEN);
  const providedKey = scryptSync(password, salt, KEY_LEN);
  return expectedKey.toString('base64') === keyB64;
}

export async function registerUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const existing = users.get(email.toLowerCase());
  if (existing) {
    return { success: false, error: 'Email already registered' };
  }
  const hash = await hashPassword(password);
  users.set(email.toLowerCase(), { email: email.toLowerCase(), passwordHash: hash });
  return { success: true };
}

export async function authenticate(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const normalized = email.toLowerCase();
  const user = users.get(normalized);
  if (!user) return { success: false, error: 'Invalid email or password' };
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { success: false, error: 'Invalid email or password' };
  return { success: true };
}

export async function getUser(email: string): Promise<StoredUser | null> {
  return users.get(email.toLowerCase()) || null;
}

export async function userExists(email: string): Promise<boolean> {
  return users.has(email.toLowerCase());
}
