import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { aiTools, getToolBySlug, getToolsByCategory } from "@/lib/ai-tools"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { findPostsMentioningTool } from "@/lib/internal-links"
import {
  JsonLdScript,
  buildSoftwareApplicationJsonLd,
} from "@/components/seo/json-ld-data"
import { env } from "@/lib/env"

export const dynamicParams = false

export async function generateStaticParams() {
  return aiTools.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) return {}
  return {
    title: `${tool.name} — ${tool.tagline}`,
    description: tool.description,
    alternates: { canonical: `/ai-tools/${tool.slug}` },
  }
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) notFound()

  const alternatives = getToolsByCategory(tool.category)
    .filter((t) => t.slug !== tool.slug)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
  const mentioningPosts = findPostsMentioningTool(tool.slug)

  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "https://agentika.my.id"
  const toolJsonLd = buildSoftwareApplicationJsonLd({
    name: tool.name,
    description: tool.description,
    url: `${baseUrl}/ai-tools/${tool.slug}`,
    rating: tool.rating,
    pricing: tool.pricing,
  })

  return (
    <section className="container py-8">
      <JsonLdScript json={toolJsonLd} id="tool-json-ld" />
      <Link
        href="/ai-tools"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Semua tools
      </Link>

      <div className="space-y-4 mt-6 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {tool.name}
          </h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              tool.pricing === "Free"
                ? "border-green-300 text-green-700 bg-green-50"
                : tool.pricing === "Freemium"
                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                  : "border-blue-300 text-blue-700 bg-blue-50"
            }`}
          >
            {tool.pricing}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-muted">
            {tool.category}
          </span>
          {tool.newThisWeek && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50">
              Baru minggu ini
            </span>
          )}
          {tool.curatedForUmkm && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-violet-300 text-violet-700 bg-violet-50">
              Pilihan untuk UMKM
            </span>
          )}
        </div>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
          {tool.tagline}
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <span className="text-yellow-500">★</span> {tool.rating} / 5
        </p>
        <p>
          <Link
            href={`/ai-tools/bandingkan?tools=${tool.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Bandingkan {tool.name} dengan tool lain →
          </Link>
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        <div>
          <h2 className="text-xl font-semibold mb-2">Tentang {tool.name}</h2>
          <p className="text-muted-foreground">{tool.description}</p>
        </div>

        {tool.features && tool.features.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Fitur utama</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {tool.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {((tool.pros && tool.pros.length > 0) ||
          (tool.cons && tool.cons.length > 0)) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {tool.pros && tool.pros.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Kelebihan</h2>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {tool.pros.map((pro) => (
                    <li key={pro}>{pro}</li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons && tool.cons.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Kekurangan</h2>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {tool.cons.map((con) => (
                    <li key={con}>{con}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tool.affiliateLink && (
          <div>
            <a
              href={tool.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Kunjungi {tool.name} ↗
            </a>
          </div>
        )}

        {alternatives.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Alternatif di kategori {tool.category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {alternatives.map((alt) => (
                <Link key={alt.slug} href={`/ai-tools/${alt.slug}`}>
                  <Card className="h-full transition-all hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{alt.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {alt.tagline}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <span className="text-yellow-500">★</span> {alt.rating}
                        <span className="ml-2 px-2 py-0.5 rounded bg-muted">
                          {alt.pricing}
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {mentioningPosts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Artikel yang membahas {tool.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {mentioningPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-lg border p-4 transition-colors hover:border-primary"
                >
                  <p className="text-sm text-muted-foreground">
                    {post.category ?? "General"}
                  </p>
                  <p className="mt-1 font-semibold">{post.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt ?? "Tanpa deskripsi."}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <InternalLinksBlock title="Jelajahi Konten Lain" />
      </div>
    </section>
  )
}
