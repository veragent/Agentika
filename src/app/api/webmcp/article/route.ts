import { NextRequest, NextResponse } from "next/server"
import { getFileBySlug, type PostMetadata } from "@/lib/mdx"
import {
  extractHeadings,
  isValidSlug,
  mdxToPlainText,
  truncateText,
} from "@/lib/webmcp"

/**
 * GET /api/webmcp/article?slug=<slug>
 * Read-only backing endpoint for the WebMCP `get_blog_article` tool.
 * Returns only already-public blog content: title, excerpt, headings,
 * and a truncated plain-text preview (never the raw MDX source).
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? ""
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "slug tidak valid" }, { status: 400 })
  }

  const post = getFileBySlug("blog", slug)
  if (!post) {
    return NextResponse.json({ error: "artikel tidak ditemukan" }, { status: 404 })
  }

  const frontMatter = post.frontMatter as PostMetadata & {
    description?: string
  }
  const plain = mdxToPlainText(post.content)

  return NextResponse.json({
    title: frontMatter.title,
    excerpt: frontMatter.excerpt ?? frontMatter.description ?? "",
    url: `/blog/${slug}`,
    date: frontMatter.date ?? null,
    headings: extractHeadings(post.content),
    preview: truncateText(plain, 1200),
    previewTruncated: plain.length > 1200,
  })
}
