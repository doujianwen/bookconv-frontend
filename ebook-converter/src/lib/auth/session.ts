// src/lib/auth/session.ts
import { cookies } from 'next/headers';
import { signJwt, verifyJwt } from './jwt';

const TOKEN_NAME = 'bookconv-token';
const SECRET = process.env.AUTH_SECRET || 'change-me-in-production-use-a-long-random-string';
const EXPIRY_DAYS = 30;
const EXPIRY_SECONDS = EXPIRY_DAYS * 24 * 3600;

export interface SessionPayload {
  email: string;
}

export async function createSession(email: string): Promise<string> {
  return signJwt(
    { sub: email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + EXPIRY_SECONDS },
    SECRET
  );
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token, SECRET);
  if (!payload) return null;
  return { email: payload.sub };
}

export function setAuthCookie(token: string) {
  return {
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: EXPIRY_DAYS * 86400, // seconds
  };
}

export function clearAuthCookie() {
  return {
    name: TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}
