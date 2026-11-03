// src/middleware/security.ts — Add security headers to every response.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── HTML 边缘缓存策略（M12-3，2026-11-03 tabbit 外部实测后补）────────────
// 为什么在这里设而不是 next.config.ts headers()：
// 线上（Vercel）动态渲染会把 Cache-Control 覆盖成 `private, no-store`，
// next.config 的 headers() 对动态路由不生效（本地 next start 顺序相反所以
// 本地能看到 public）——「本地绿≠线上绿」的根源。middleware 响应头是最终
// 响应头，两个平台都赢。s-maxage 才是 Vercel Edge Cache 的计时口径
// （max-age 只管浏览器），所以两者都写。
// 安全前提（均已实测）：locale 由路径驱动（/ 与 /es/ 分流）、登录态由
// 客户端 /api/auth/me 解析（SSR HTML 与用户无关）⇒ 同一 URL 对所有用户
// 渲染相同，按 URL 缓存安全。auth/api/admin 不在规则内，保持 no-store。
const HTML_CACHE_RULES: Array<[RegExp, string]> = [
  [/^\/(?:es\/)?blog\//, 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'],
  [/^\/(?:es\/)?guide\//, 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'],
  [/^\/(?:es\/)?formats\//, 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'],
  [/^\/(?:es\/)?convert\//, 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600'],
  [/^\/(?:es\/)?data\//, 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600'],
  [/^\/(?:es\/)?(?:about|pricing|help|compare|batch|founder|tutorial|terms|privacy)\/?$/, 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'],
  [/^\/(?:es)?\/?$/, 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600'],
];

export function applySecurityHeaders(request: NextRequest, response: NextResponse = NextResponse.next()): NextResponse {
  // HTML 缓存策略：只对 GET/HEAD 且状态 200 的公开内容页生效。
  // 状态门控是防把 middleware 生成的 404（P3-C 白名单拦截）也缓存出去。
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    response.status === 200
  ) {
    const pathname = request.nextUrl.pathname;
    for (const [pattern, value] of HTML_CACHE_RULES) {
      if (pattern.test(pathname)) {
        response.headers.set('Cache-Control', value);
        break;
      }
    }
  }

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
