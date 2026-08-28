// src/lib/auth/jwt.ts
// Minimal JWT using base64url (no npm dependency). HmacSHA256 via Web Crypto API.
import { timingSafeEqual } from 'node:crypto';

const encoder = new TextEncoder();

function base64urlEncode(data: Uint8Array): string {
  return Buffer.from(data).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

async function hmacSign(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, message.buffer as ArrayBuffer);
  return new Uint8Array(sig);
}

interface JwtPayload {
  sub: string; // userId (email)
  iat: number;
  exp: number;
}

export async function signJwt(payload: JwtPayload, secret: string): Promise<string> {
  const header = base64urlEncode(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = encoder.encode(header + '.' + body);
  const signature = await hmacSign(encoder.encode(secret), signingInput);
  return header + '.' + body + '.' + base64urlEncode(signature);
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const signingInput = encoder.encode(headerB64 + '.' + payloadB64);
    const expectedSig = await hmacSign(encoder.encode(secret), signingInput);
    const actualSig = base64urlDecode(sigB64);
    if (!timingSafeEqual(expectedSig, actualSig)) return null;
    const payloadJson = new TextDecoder().decode(base64urlDecode(payloadB64));
    const payload: JwtPayload = JSON.parse(payloadJson);
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseJwtSafe(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = new TextDecoder().decode(base64urlDecode(parts[1]));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
