import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "https://agentika.my.id"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/_next",
          "/auth",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
    host: baseUrl,
  }
}

export const dynamic = "force-static"