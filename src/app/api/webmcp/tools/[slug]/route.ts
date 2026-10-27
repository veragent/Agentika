import { NextRequest, NextResponse } from "next/server"
import { aiTools } from "@/lib/ai-tools"
import { isValidSlug, truncateText } from "@/lib/webmcp"

/**
 * GET /api/webmcp/tools/<slug>
 * Read-only backing endpoint for the WebMCP `get_ai_tool` tool.
 * Returns the public directory fields of one tool (no affiliate links).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "slug tidak valid" }, { status: 400 })
  }

  const tool = aiTools.find((item) => item.slug === slug)
  if (!tool) {
    return NextResponse.json({ error: "tool tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json({
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    category: tool.category,
    pricing: tool.pricing,
    rating: tool.rating,
    description: truncateText(tool.description, 600),
    features: (tool.features ?? []).slice(0, 5),
    pros: (tool.pros ?? []).slice(0, 3),
    cons: (tool.cons ?? []).slice(0, 3),
    url: `/ai-tools/${tool.slug}`,
  })
}
