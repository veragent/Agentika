import type { MetadataRoute } from "next"
import { getAllFilesMetadata } from "@/lib/mdx"
import { getPublishedBlogPosts } from "@/lib/blog"
import { env } from "@/lib/env"

const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "https://agentika.my.id"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = getPublishedBlogPosts()
  const learnPages = getAllFilesMetadata("learn")

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/blog", priority: 0.9 },
    { path: "/learn", priority: 0.9 },
    { path: "/faq", priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date ?? new Date().toISOString()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const learnRoutes: MetadataRoute.Sitemap = learnPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }))

  return [...staticRoutes, ...blogRoutes, ...learnRoutes]
}

export const dynamic = "force-static"