import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@/lib/conversion-map"],
  outputFileTracingRoot: process.cwd(),
}

export default nextConfig