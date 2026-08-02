import type { NextConfig } from "next"
import withNextIntl from "next-intl/plugin";

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
  transpilePackages: ["@/lib/conversion-map"],
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
          { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${CORS_ORIGINS.map((o) => o.replace(/^https?:\/\//, '')).join(' ')}; font-src 'self' data:; connect-src 'self' ${CORS_ORIGINS.join(' ')} https://www.google-analytics.com https://*.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self';` },
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
          { key: "Cache-Control", value: "public, s-maxage=10, stale-while-revalidate=59" },
        ]},
      { source: "/blog/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }] },
      { source: "/convert/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=3600" }] },
    ]
  },
  async redirects() {
    return [
      { source: "/converter/:slug", destination: "/convert/:slug", permanent: true },
      { source: "/(.*)", has: [{ type: "header", key: "x-forwarded-proto", value: "http" }], destination: "https://www.bookconv.com/$1", permanent: true },
    ]
  },
  experimental: {},
  compress: false,
};

export default withNextIntl("./src/i18n/request.ts")(config);
