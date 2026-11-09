import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"
import { WEBMCP_ORIGIN_TRIAL_TOKEN } from "./src/lib/origin-trial"

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
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://giscus.app",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://og-images.pearlanalytics.ai https://*.vercel.app https://*.amazonaws.com https://images.unsplash.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.google.com",
      "connect-src 'self' https://api.coingecko.com https://*.vercel.app wss: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
      "frame-src 'self' https://www.youtube.com https://www.googletagmanager.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://giscus.app",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  {
    // WebMCP origin trial: activates document.modelContext for visitors
    // on www.agentika.web.id. Token is public by design (see origin-trial.ts).
    key: "Origin-Trial",
    value: WEBMCP_ORIGIN_TRIAL_TOKEN,
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
  // Learn URLs: 301 redirect legacy /<category>/<slug> (pre-/learn/ prefix, 404 in GSC)
  // to /learn/<category>/<slug>.
  // Removed/draft URLs (GSC 404 + noindex, 9 Nov 2026): 301 to the closest
  // live equivalent. Draft -en posts point at their Indonesian version; if
  // an -en post is ever published, remove its redirect first.
  // Learn track indexes (/learn/<track>) have no category page and 404:
  // 301 to the Learn overview.
  async redirects() {
    const removedRedirects = [
      { source: "/blog/prompt-engineering-untuk-konten", destination: "/blog/prompt-engineering-seni-berbicara-ai" },
      { source: "/blog/perbandingan-llm-2026-en", destination: "/blog/perbandingan-llm-2026" },
      { source: "/blog/10-ai-tools-produktivitas-en", destination: "/blog/10-ai-tools-produktivitas" },
      { source: "/blog/ai-tools/perbandingan-llm-2026-en", destination: "/blog/perbandingan-llm-2026" },
      { source: "/blog/ai-tools/10-ai-tools-produktivitas-en", destination: "/blog/10-ai-tools-produktivitas" },
    ]
    const learnTrackIndexes = [
      "ai-automation",
      "ai-basics",
      "no-code-tools",
      "prompt-engineering-umkm",
    ]
    const legacyCategories = [
      "ai-tools",
      "ai-automation",
      "prompt-engineering",
      "side-hustle",
      "umkm-case-studies",
    ]
    const legacyLearnCategories = [
      "ai-automation",
      "ai-basics",
      "no-code-tools",
      "prompt-engineering-umkm",
    ]
    return [
      // Explicit removed-URL redirects first: first match wins, so the
      // legacy /blog/ai-tools/:slug rule below never turns these into a
      // two-hop chain ending in a 404.
      ...removedRedirects.map((r) => ({ ...r, permanent: true })),
      ...learnTrackIndexes.map((track) => ({
        source: `/learn/${track}`,
        destination: "/learn",
        permanent: true,
      })),
      ...legacyCategories.map((cat) => ({
        source: `/blog/${cat}/:slug`,
        destination: "/blog/:slug",
        permanent: true,
      })),
      ...legacyLearnCategories.map((cat) => ({
        source: `/${cat}/:slug`,
        destination: `/learn/${cat}/:slug`,
        permanent: true,
      })),
    ]
  },
}

export default withBundleAnalyzer(nextConfig)