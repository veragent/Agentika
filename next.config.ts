import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  
  // Image optimization - Netlify Image CDN handles optimization automatically
  // We keep our config for remote patterns and formats
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    remotePatterns: [
      { protocol: "https", hostname: "og-images.pearlanalytics.ai" },
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  
  // Security headers via next.config (also in netlify.toml for edge)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
  
  // Ensure proper handling of API routes
  async rewrites() {
    return [
      {
        source: "/api/newsletter/subscribe",
        destination: "/api/newsletter/subscribe",
      },
    ]
  },

  // Blog flat URLs: 301 redirect legacy /blog/<category>/<slug> to /blog/<slug>.
  // Disk folders under content/blog/ remain for organization; public URLs are flat.
  async redirects() {
    const legacyCategories = [
      "ai-tools",
      "ai-automation",
      "prompt-engineering",
      "side-hustle",
      "umkm-case-studies",
    ]
    return legacyCategories.map((cat) => ({
      source: `/blog/${cat}/:slug`,
      destination: "/blog/:slug",
      permanent: true,
    }))
  },
}

export default withBundleAnalyzer(nextConfig)