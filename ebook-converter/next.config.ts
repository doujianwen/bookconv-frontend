import type { NextConfig } from "next"
import withNextIntl from "next-intl/plugin";
import { buildContentSecurityPolicy } from "./src/lib/csp";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.bookconv.com';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || APP_URL)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const config: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
              return `vendor.${packageName?.replace('@', '')}`;
            },
            priority: 20,
          },
          react: {
            test: /[\\/]node_modules[\\/]_(react|react-dom|scheduler)[\\/]/,
            name: 'vendor.react',
            priority: 30,
          },
        },
      };
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      config.optimization.concatenateModules = true;
    }
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [{ protocol: "https", hostname: "www.bookconv.com", pathname: "/**" }],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75, 85, 95],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // 2026-11-06 P0 根因修复：connect-src 必须放行 R2 直传 PUT 的 host。
          // 未放行时浏览器在发请求前就拒绝（TypeError / 无 status / <1s），
          // 即 GA4 诊断前缀 PUT:NETWORK:on=1:<1s 的真因；见 src/lib/csp.ts。
          { key: "Content-Security-Policy", value: buildContentSecurityPolicy(CORS_ORIGINS, process.env.R2_ENDPOINT) },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
      { source: "/_next/static/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/(robots\\.txt|manifest\\.json|og-image\\.svg|favicon\\.ico|icon\\.svg|apple-touch-icon\\.png)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/_next/image(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/api/(.*)", headers: [
          { key: "Access-Control-Allow-Origin", value: CORS_ORIGINS.join(', ') },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Idempotency-Key, X-Request-ID" },
          { key: "Access-Control-Max-Age", value: "86400" },
          // 2026-10-28 收窄：原 "public, s-maxage=10, stale-while-revalidate=59"
          // 会把 GET API 缓存进 CDN 最长约 69s——auth/me（跨用户会话风险）、
          // health（监控假象）、rate-limit 429 响应都被殃及。全部 API 路由均为
          // 动态数据，无一受益；路由内自设的 Cache-Control（如 presign 探针
          // no-store）优先级更高，不受影响。
          { key: "Cache-Control", value: "no-store" },
        ]},
      // 2026-11-03 M12-3：补 s-maxage（Vercel Edge Cache 计时口径，max-age 只管
      // 浏览器）。注意：线上动态路由的 headers() 会被渲染默认 no-store 覆盖，
      // 真正生效的是 middleware/security.ts 的 HTML_CACHE_RULES——两处保持同步。
      { source: "/blog/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" }] },
      { source: "/convert/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=300, s-maxage=300, stale-while-revalidate=3600" }] },
      { source: "/guide/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" }] },
      { source: "/formats/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" }] },
    ]
  },
  async redirects() {
    return [
      { source: "/blog/epub-to-various-other", destination: "/blog/epub-converter", permanent: true },
      { source: "/blog/lord-of-the-rings-ebooks-multiple-devices", destination: "/blog/read-epub-on-any-device", permanent: true },
      { source: "/blog/twilight-ebooks-multiple-devices", destination: "/blog/read-epub-on-any-device", permanent: true },
      { source: "/blog/marvel-comics-ebooks-multiple-devices", destination: "/blog/read-epub-on-any-device", permanent: true },
      { source: "/es/guide/azw3-vs-mobi", destination: "/es/blog/azw3-vs-mobi", permanent: true },
      { source: "/converter/:slug", destination: "/convert/:slug", permanent: true },
      { source: "/(.*)", has: [{ type: "header", key: "x-forwarded-proto", value: "http" }], destination: "https://www.bookconv.com/$1", permanent: true },
    ]
  },
  experimental: {
    // M12-3 静态化：next/root-params 提供根布局动态段参数（locale），
    // 让 getLocale() 摆脱 headers()/cookies() ⇒ 页面可静态化 ⇒ 边缘缓存生效
    rootParams: true,
  },
  compress: true,
};

export default withNextIntl("./src/i18n/request.ts")(config);
