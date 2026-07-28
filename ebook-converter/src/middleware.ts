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
  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const corsResponse = new NextResponse(null, { status: 204 });
    return applySecurityHeaders(request, corsResponse);
  }

  // Only process non-API routes for locale detection
  if (pathname.startsWith('/api/')) {
    return applySecurityHeaders(request);
  }

  // Locale-prefix strategy: 'as-needed'
  // - English (default) is served WITHOUT a prefix: /, /convert/epub-to-pdf, /blog
  // - Spanish uses the /es prefix
  // - /en/* is a legacy/duplicate of the no-prefix English URL → 301 redirect

  const localeFromPath = getLocaleFromPath(pathname);

  // Case 1: path HAS a locale prefix
  if (localeFromPath) {
    // /en/* → 301 to canonical no-prefix version (SEO: avoid duplicate URLs)
    if (localeFromPath === 'en') {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(/^\/en/, '') || '/';
      const response = NextResponse.redirect(url, { status: 301 });
      return applySecurityHeaders(request, response);
    }
    // /es/* → serve Spanish directly
    const response = NextResponse.next();
    response.cookies.set('locale', 'es', { maxAge: 31536000, path: '/' });
    return applySecurityHeaders(request, response);
  }

  // Case 2: path has NO locale prefix
  // Root "/" → English homepage (no prefix)
  if (pathname === '/') {
    const response = NextResponse.next();
    response.cookies.set('locale', defaultLocale, { maxAge: 31536000, path: '/' });
    return applySecurityHeaders(request, response);
  }

  // Other no-prefix paths (e.g., /convert/epub-to-pdf, /pricing, /blog/...)
  // → internally rewrite to /en/<path> so the [locale] route serves English,
  //   while the browser URL stays unprefixed (clean, SEO-friendly).
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  const response = NextResponse.rewrite(url);
  response.cookies.set('locale', defaultLocale, { maxAge: 31536000, path: '/' });
  return applySecurityHeaders(request, response);
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
