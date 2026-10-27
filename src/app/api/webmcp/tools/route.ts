import { NextRequest, NextResponse } from "next/server"
import { aiTools } from "@/lib/ai-tools"

/**
 * GET /api/webmcp/tools?category=<category>
 * Read-only backing endpoint for the WebMCP `list_ai_tools` tool.
 * Returns at most 10 tools with their public directory fields.
 * Affiliate links are deliberately NOT exposed here: agents link to the
 * canonical Agentika tool page, which itself links out to the vendor.
 */
export async function GET(request: NextRequest) {
  const category = (request.nextUrl.searchParams.get("category") ?? "").trim()
  const filtered = category
    ? aiTools.filter(
        (tool) => tool.category.toLowerCase() === category.toLowerCase(),
      )
    : aiTools

  const items = filtered.slice(0, 10).map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    category: tool.category,
    pricing: tool.pricing,
    rating: tool.rating,
    url: `/ai-tools/${tool.slug}`,
  }))

  return NextResponse.json({
    total: filtered.length,
    count: items.length,
    tools: items,
  })
}
