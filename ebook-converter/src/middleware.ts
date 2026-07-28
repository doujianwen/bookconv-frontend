import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from './middleware/security';

const locales = ['en', 'es'];
const defaultLocale = 'en';

// Get locale from URL path (e.g., /es/blog -> 'es')
function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0])) {
    return segments[0];
  }
  return null;
}

export async function middleware(request: NextRequest) {
  // Apply security headers to every response
  applySecurityHeaders(request);

  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const corsResponse = new NextResponse(null, { status: 204 });
    return corsResponse;
  }

  // Only process non-API routes for locale detection
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if locale is already in the path
  const localeFromPath = getLocaleFromPath(pathname);

  if (localeFromPath && locales.includes(localeFromPath)) {
    // Locale is in path, set cookie and continue
    const response = NextResponse.next();
    response.cookies.set('locale', localeFromPath, { maxAge: 31536000, path: '/' });
    return response;
  }

  // SEO: English is the default locale served at / (no prefix)
  // If someone explicitly visits /en, redirect to canonical /
  if (pathname === '/en' || pathname === '/en/') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, { status: 301 });
  }

  // Root path "/" serves the English homepage directly — no redirect needed
  if (pathname === '/') {
    const response = NextResponse.next();
    response.cookies.set('locale', defaultLocale, { maxAge: 31536000, path: '/' });
    return response;
  }

  // No locale in path for other URLs (e.g., /pricing) — check cookie first
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    // Redirect to add locale prefix for non-root paths
    const url = request.nextUrl.clone();
    url.pathname = '/' + cookieLocale + url.pathname;
    return NextResponse.redirect(url);
  }

  // No locale — redirect to default locale prefix for non-root paths
  const url = request.nextUrl.clone();
  url.pathname = '/' + defaultLocale + url.pathname;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
