import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // ===========================================================================
  // Performance & Bundle Optimization
  // ===========================================================================

  // Limit the number of parallel webpack compilations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Reduce chunk count in production to lower request overhead
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          // Merge small vendor chunks into one
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1];
              return `vendor.${packageName?.replace('@', '')}`;
            },
            priority: 20,
          },
          // Separate React / Next.js runtime
          react: {
            test: /[\\/]node_modules[\\/]_(react|react-dom|scheduler)[\\/]/,
            name: 'vendor.react',
            priority: 30,
          },
        },
      };

      // Minimize output for production
      config.optimization.minimize = true;
      config.optimization.usedExports = true; // enable tree-shaking
      config.optimization.concatenateModules = true;
    }
    return config;
  },

  transpilePackages: ["@/lib/conversion-map"],

  // ===========================================================================
  // Image Optimization — Step 2
  // ===========================================================================
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bookconv.com",
        pathname: "/**",
      },
    ],
    // Optimize image quality vs size tradeoff
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Lower quality for faster TTFB, let CDN handle further optimization
    qualities: [60, 75, 85, 95],
    // Enable dangerouslyAllowSVG — we serve our own SVGs
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ===========================================================================
  // Performance Headers — Step 1 + Step 4
  // ===========================================================================

  // Security & SEO headers
  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Cross-Origin-Opener-Policy for isolated browsing context
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Content-Security-Policy (relaxed for Next.js)
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://bookconv.com; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" },
          // HSTS for HTTPS enforcement
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // DNS prefetch for external resources
          { key: "DPR", value: "2" },
          { key: "Device-Memory", value: "8" },
        ],
      },
      // Long-term cache for Next.js static assets
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Long-term cache for public static files
      {
        source: "/(robots\\.txt|manifest\\.json|og-image\\.svg|favicon\\.ico|icon\\.svg|apple-touch-icon\\.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Image optimization endpoint — moderate cache
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache API responses briefly (convert status, health checks, etc.)
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=10, stale-while-revalidate=59" },
        ],
      },
      // Blog posts — long cache since content is mostly static
      {
        source: "/blog/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      // Convert pages — short cache to keep dynamic behavior fresh
      {
        source: "/convert/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=3600" },
        ],
      },
    ]
  },

  // ===========================================================================
  // Redirects for SEO
  // ===========================================================================
  async redirects() {
    return [
      // Redirect old-style URLs to canonical format
      {
        source: "/converter/:slug",
        destination: "/convert/:slug",
        permanent: true,
      },
      // Enforce HTTPS
      {
        source: "/(.*)",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://bookconv.com/$1",
        permanent: true,
      },
    ]
  },

  // ===========================================================================
  // Experimental: Incremental App Router features (Next.js 15+)
  // ===========================================================================
  experimental: {
    cacheComponents: true, // Incremental Prerendering for fast TTFB
    // Optimize server component rendering
    optimizePackageImports: ['lucide-react', '@tailwindcss/typography', 'bullmq', 'ioredis', '@supabase/ssr'],
    // Enable React compiler for auto-memoization
    // reactCompiler: true, // Uncomment when ready for React 19 compiler
  },

  // ===========================================================================
  // Compression
  // ===========================================================================
  compress: true,

  // ===========================================================================
  // Trailing slash for consistent SEO
  // ===========================================================================
  // trailingSlash: false, // Keep as-is for App Router best practices
}

export default nextConfig
