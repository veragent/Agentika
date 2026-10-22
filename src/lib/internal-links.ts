import { aiTools, type AITool } from "@/lib/ai-tools"
import { getPublicBlogPostBySlug, getPublishedBlogPosts } from "@/lib/blog"
import type { PostMetadata } from "@/lib/mdx"

/**
 * Internal linking otomatis (Phase 5, batch 1).
 *
 * Dua arah:
 * - Artikel blog menautkan tool yang disebut namanya di judul,
 *   ringkasan, atau isi artikel.
 * - Halaman detail tool menautkan artikel yang menyebut tool itu.
 *
 * Skor sebutan: judul 3, ringkasan 2, isi 1 per sebutan (maksimum 3).
 * Tool hanya ditautkan bila skor >= 2 supaya tautan tetap relevan.
 * Nama tool yang terlalu pendek (< 4 huruf) dilewati untuk menghindari
 * salah cocok dengan kata umum.
 */

function namePattern(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`\\b${escaped}\\b`, "gi")
}

export function findMentionedTools(
  input: { title: string; excerpt?: string; content: string },
  limit = 3,
): AITool[] {
  const scored: { tool: AITool; score: number }[] = []
  for (const tool of aiTools) {
    if (tool.name.length < 4) continue
    let score = 0
    if (namePattern(tool.name).test(input.title)) score += 3
    if (input.excerpt && namePattern(tool.name).test(input.excerpt)) {
      score += 2
    }
    const bodyMatches =
      input.content.match(namePattern(tool.name))?.length ?? 0
    score += Math.min(bodyMatches, 3)
    if (score >= 2) scored.push({ tool, score })
  }
  return scored
    .sort((a, b) => b.score - a.score || b.tool.rating - a.tool.rating)
    .slice(0, limit)
    .map((entry) => entry.tool)
}

let postsByToolSlug: Map<string, PostMetadata[]> | null = null

function buildPostsByToolSlug(): Map<string, PostMetadata[]> {
  const map = new Map<string, PostMetadata[]>()
  for (const post of getPublishedBlogPosts()) {
    const full = getPublicBlogPostBySlug(post.slug)
    if (!full) continue
    for (const tool of findMentionedTools(full, aiTools.length)) {
      const list = map.get(tool.slug) ?? []
      list.push(post)
      map.set(tool.slug, list)
    }
  }
  return map
}

export function findPostsMentioningTool(
  toolSlug: string,
  limit = 3,
): PostMetadata[] {
  postsByToolSlug ??= buildPostsByToolSlug()
  return (postsByToolSlug.get(toolSlug) ?? []).slice(0, limit)
}
