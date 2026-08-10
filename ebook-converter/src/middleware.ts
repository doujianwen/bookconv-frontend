import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from './middleware/security';

const locales = ['en', 'es'];
const defaultLocale = 'en';

// 301 redirects for deduplicated conversion pages.
// These slugs were removed from KEYWORDS (and thus sitemap/generateStaticParams)
// to avoid keyword cannibalization. Middleware catches any runtime request
// (including old indexed URLs) and redirects to the canonical page.
const CONVERSION_REDIRECTS: Record<string, string> = {
  '/convert/epub-to-text': '/convert/epub-to-txt',
  '/convert/epub-to-docx': '/convert/epub-to-word',
};

// 301 redirects for deduplicated blog posts.
// These slugs were removed from the blog registry (src/data/blog/index.ts)
// and llms.txt to end keyword cannibalization. Middleware catches any runtime
// request (including old indexed URLs / backlinks) and redirects to the
// canonical page. Locale prefix (/, /es/) is preserved by the caller below.
const BLOG_REDIRECTS: Record<string, string> = {
  '/blog/how-to-convert-epub-to-mobi': '/blog/epub-to-mobi-guide',
  '/blog/epub-vs-azw3-vs-mobi': '/blog/ebook-formats-explained',
  '/blog/mobi-or-azw3-for-kindle': '/blog/azw3-vs-mobi',
  '/guide/mobi-vs-azw3': '/blog/azw3-vs-mobi',
};

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

  // 301 redirects for deduplicated conversion pages (before locale handling
  // to catch /, /es/, and /en/ variants in a single pass — no double redirects)
  const pathWithoutLocale = localeFromPath ? pathname.replace(/^\/(?:en|es)/, '') : pathname;
  // Deduplicated conversion pages + blog posts → 301 to canonical (locale preserved)
  const redirectTarget =
    CONVERSION_REDIRECTS[pathWithoutLocale] ?? BLOG_REDIRECTS[pathWithoutLocale];
  if (redirectTarget) {
    const localePrefix = localeFromPath === 'es' ? '/es' : '';
    const url = request.nextUrl.clone();
    url.pathname = localePrefix + redirectTarget;
    const response = NextResponse.redirect(url, { status: 301 });
    return applySecurityHeaders(request, response);
  }

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
  // Root "/" → serve the English homepage through the [locale] route so it
  // inherits the homepage hreflang from [locale]/layout.tsx (the browser URL
  // stays "/" — the rewrite is internal only).
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/';
    const response = NextResponse.rewrite(url);
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
     * - sitemap.xml, robots.txt (metadata files — must bypass i18n rewrite)
     */
    '/((?!api|auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|rss.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|html)$).*)',
  ],
};
