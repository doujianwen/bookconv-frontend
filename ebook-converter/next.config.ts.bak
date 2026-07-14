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
            name(module) {
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
    }
    return config;
  },

  transpilePackages: ["@/lib/conversion-map"],

  // ===========================================================================
  // Image Optimization
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
    // If serving images from an external CDN, set the domain here
    // domains: ['cdn.bookconv.com'],
  },

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
          // Cross-Origin-Embedder-Policy (use with caution; remove if third-party scripts break)
          // { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
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
      // Cache API responses briefly (convert status, health checks, etc.)
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=10, stale-while-revalidate=59" },
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
    ]
  },

  // ===========================================================================
  // Experimental: Incremental App Router features (Next.js 15+)
  // ===========================================================================
  experimental: {
    cacheComponents: true, // Incremental Prerendering for fast TTFB
  },
}

export default nextConfig
