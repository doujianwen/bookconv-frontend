import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@/lib/conversion-map"],
}

export default nextConfig
