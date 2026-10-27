import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { components, mdxOptions } from "@/components/mdx"
import { MarkCompleteButton } from "@/components/learn/lesson-progress"
import { ChatSidebar } from "@/components/learn/chat-sidebar"
import {
  JsonLdScript,
  buildLearningResourceJsonLd,
} from "@/components/seo/json-ld-data"
import { getLearnNavigation, getLearnPageBySlug, getLearnPagination } from "@/lib/learn"
import { env } from "@/lib/env"
import type { Metadata } from "next"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import { notFound } from "next/navigation"

interface LearnPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const nav = await getLearnNavigation()
  const pages = nav.flatMap((track) =>
    track.sections.flatMap((section) => section.pages),
  )
  // Full paths (track/slug) plus bare last segments: both forms resolve
  // today via the basename fallback in getFileBySlug, so both stay 200.
  // Anything outside this set now 404s at routing level instead of
  // rendering the not-found UI with a 200 (soft 404).
  const params = new Map<string, { slug: string[] }>()
  for (const page of pages) {
    const parts = page.slug.split("/")
    params.set(page.slug, { slug: parts })
    const bare = parts[parts.length - 1]
    if (bare) params.set(`bare:${bare}`, { slug: [bare] })
  }
  return [...params.values()]
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  const { slug } = await params
  const slugPath = slug.join("/")
  const page = await getLearnPageBySlug(slugPath)

  if (!page) {
    return { title: "Materi tidak ditemukan" }
  }

  return {
    title: page.title,
    description: page.excerpt,
    alternates: { canonical: `/learn/${slugPath}` },
  }
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params
  const slugPath = slug.join("/")
  const page = await getLearnPageBySlug(slugPath)

  if (!page) {
    notFound()
  }

  const { prev, next } = await getLearnPagination(slugPath)

  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "https://agentika.my.id"
  const lessonJsonLd = buildLearningResourceJsonLd({
    title: page.title,
    description: page.excerpt ?? "",
    url: `${baseUrl}/learn/${slugPath}`,
    trackTitle: page.trackTitle,
  })

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
    <article className="space-y-8 py-6">
      <JsonLdScript json={lessonJsonLd} id="lesson-json-ld" />
      <nav className="text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-primary">
          Learn
        </Link>
        {page.trackTitle && <span> / {page.trackTitle}</span>}
        {page.sectionTitle && <span> / {page.sectionTitle}</span>}
        <span> / {page.title}</span>
      </nav>

      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={page.content} components={components} options={mdxOptions} />
      </div>

      <div className="flex justify-center border-t pt-6">
        <MarkCompleteButton lessonId={slugPath} />
      </div>

      <div className="grid gap-3 border-t pt-6 md:grid-cols-2">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="rounded-lg border p-4 transition-colors hover:border-primary">
            <p className="text-xs text-muted-foreground">&larr; Previous Lesson</p>
            <p className="mt-1 font-medium">{prev.title}</p>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Ini lesson pertama.</div>
        )}

        {next ? (
          <Link href={`/learn/${next.slug}`} className="rounded-lg border p-4 text-right transition-colors hover:border-primary">
            <p className="text-xs text-muted-foreground">Next Lesson &rarr;</p>
            <p className="mt-1 font-medium">{next.title}</p>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Ini lesson terakhir.</div>
        )}
      </div>

      <AdSlot section="learn_detail" className="rounded-xl border p-4" />
      <InternalLinksBlock />
    </article>
    <ChatSidebar slug={slugPath} lessonTitle={page.title} />
    </div>
  )
}