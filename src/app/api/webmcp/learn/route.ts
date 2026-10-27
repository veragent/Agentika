import { NextRequest, NextResponse } from "next/server"
import { getLearnNavigation } from "@/lib/learn"

/**
 * GET /api/webmcp/learn?track=<track>
 * Read-only backing endpoint for the WebMCP `list_learn_lessons` tool.
 * Returns at most 15 lessons with their public Learn URLs.
 */
export async function GET(request: NextRequest) {
  const track = (request.nextUrl.searchParams.get("track") ?? "").trim()
  const nav = await getLearnNavigation()
  const tracks = track ? nav.filter((item) => item.slug === track) : nav

  const lessons = tracks.flatMap((item) =>
    item.sections.flatMap((section) =>
      section.pages.map((page) => ({
        track: item.slug,
        trackTitle: item.title,
        section: section.title,
        title: page.title,
        url: `/learn/${page.slug}`,
      })),
    ),
  )

  return NextResponse.json({
    total: lessons.length,
    count: Math.min(lessons.length, 15),
    lessons: lessons.slice(0, 15),
  })
}
