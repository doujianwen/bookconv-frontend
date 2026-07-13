import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@/lib/conversion-map"],

  // Security & SEO headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
            missing: { op: "header", name: "Cache-Control" },
          },
        ],
      },
    ]
  },

  // Image optimization for OG image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bookconv.com",
        pathname: "/**",
      },
    ],
  },

  // Redirects for SEO
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
}

export default nextConfig