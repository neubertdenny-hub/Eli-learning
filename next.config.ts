import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // ========== IMAGE OPTIMIZATION ==========
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
    unoptimized: false,
  },

  // ========== REACT ==========
  reactStrictMode: true,

  // ========== BUILD OUTPUT ==========
  output: "standalone",

  // ========== TYPESCRIPT ==========
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // ========== COMPRESSION & OPTIMIZATION ==========
  compress: true,
  productionBrowserSourceMaps: false,

  // ========== HEADERS FOR PWA ==========
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, must-revalidate",
          },
        ],
      },
    ]
  },

  // ========== EXPERIMENTAL ==========
  experimental: {
    optimizePackageImports: ["@vercel/blob", "@vercel/kv"],
  },
}

export default nextConfig
