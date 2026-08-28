// src/middleware/security.ts — Add security headers to every response.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function applySecurityHeaders(request: NextRequest, response: NextResponse = NextResponse.next()): NextResponse {
  // HTTPS-only (HSTS) — 1 year, includeSubDomains
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload',
  );

  // XSS protection (fallback for older browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy — restrict features we don't need
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  );

  // Content Security Policy is intentionally NOT set here.
  // next.config.ts already sets a comprehensive CSP via async headers().
  // Keeping it here would override that header with a stricter policy that
  // blocks Next.js inline hydration scripts and third-party analytics.

  return response;
}
