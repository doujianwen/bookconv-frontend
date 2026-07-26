import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from './middleware/security';

const CORS_ORIGINS = (process.env.CORS_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || 'https://bookconv.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const ALLOWED_HEADERS = 'Content-Type, Authorization, Idempotency-Key, X-Request-ID';

/** Extract the real client IP from x-forwarded-for header */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

/** Add CORS headers to a response */
function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin') || '*';
  if (CORS_ORIGINS.includes(origin) || CORS_ORIGINS.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function middleware(request: NextRequest) {
  // Apply security headers to every response
  applySecurityHeaders(request);

  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const corsResponse = new NextResponse(null, { status: 204 });
    return addCorsHeaders(request, corsResponse);
  }

  // Only process API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next();
  return addCorsHeaders(request, response);
}

export const config = {
  matcher: ['/api/:path*'],
};