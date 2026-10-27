"use client"

import { useEffect } from "react"
import type { WebMCP } from "webmcp-types"
import {
  scoreSearchEntries,
  truncateText,
  type SearchIndexEntry,
} from "@/lib/webmcp"

/**
 * Registers Agentika's WebMCP tools (imperative API, W3C draft spec).
 *
 * Mounted once in the root layout so tools are registered on every page,
 * as early as React allows — Lighthouse captures registrations via the
 * CDP WebMCP domain, and tools registered late (after user interaction
 * or async data) can be missed by its snapshot.
 *
 * All five tools are READ-ONLY (annotations.readOnlyHint) and return only
 * already-public site content; results are marked untrustedContentHint so
 * agents treat them as facts, never as instructions. No affiliate links,
 * credentials, or user data are ever exposed.
 *
 * When the browser does not support WebMCP (no origin trial, no flag),
 * this component silently does nothing and the site works unchanged.
 */

const MAX_RESULT_CHARS = 1400

/** Cap output at a whitespace boundary, preserving line breaks. */
function capLines(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const cut = text.slice(0, maxChars)
  const boundary = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "))
  const trimmed = boundary > maxChars * 0.5 ? cut.slice(0, boundary) : cut
  return `${trimmed}…`
}

function textResult(text: string) {
  return { content: [{ type: "text", text: capLines(text, MAX_RESULT_CHARS) }] }
}

function stringParam(input: Record<string, unknown>, key: string): string {
  const value = input[key]
  return typeof value === "string" ? value.trim() : ""
}

async function fetchJson(
  path: string,
  signal: AbortSignal,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(path, { signal })
  if (!res.ok) return { ok: false, status: res.status, data: null }
  return { ok: true, status: res.status, data: (await res.json()) as unknown }
}

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  untrustedContentHint: true,
} as const

const AGENTIKA_TOOLS: WebMCP.ModelContextTool[] = [
  {
    name: "search_site",
    title: "Search site",
    description:
      "Search Agentika's published blog articles, Learn lessons, and AI tool directory by keyword. Use this first to find relevant content before recommending a specific article, lesson, or tool to the user.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Keyword to search for, for example a topic, a tool name, or a problem the user wants to solve.",
        },
        type: {
          type: "string",
          enum: ["blog", "learn", "tool"],
          description: "Limit results to one content type: blog, learn, or tool.",
        },
      },
      required: ["query"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: async (input, { signal }) => {
      const query = stringParam(input, "query")
      const type = stringParam(input, "type")
      if (!query) {
        return textResult(
          "Error: query kosong. Beri kata kunci pencarian, misalnya nama topik atau nama tool.",
        )
      }
      let index: SearchIndexEntry[]
      try {
        const { ok, data } = await fetchJson("/search-index.json", signal)
        if (!ok || !Array.isArray(data)) {
          return textResult("Error: indeks pencarian tidak tersedia saat ini.")
        }
        index = data as SearchIndexEntry[]
      } catch {
        return textResult("Error: gagal memuat indeks pencarian.")
      }
      const typeFilter =
        type === "blog" || type === "learn" || type === "tool"
          ? type
          : undefined
      const hits = scoreSearchEntries(index, query, typeFilter)
      if (hits.length === 0) {
        return textResult(
          `Tidak ada hasil untuk "${query}". Coba kata kunci lain, atau arahkan pengguna ke /blog, /learn, dan /ai-tools.`,
        )
      }
      const lines = hits.map(
        (hit) =>
          `- ${hit.title} [${hit.type}] ${hit.url}${hit.excerpt ? ` — ${truncateText(hit.excerpt, 120)}` : ""}`,
      )
      return textResult(lines.join("\n"))
    },
  },
  {
    name: "get_blog_article",
    title: "Get blog article",
    description:
      "Get the summary, section headings, and opening text of one published blog article by its slug (the last part of its /blog/ URL). Use search_site first if the slug is unknown.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description:
            "Article slug, the last part of its /blog/ URL, for example studi-kasus-laundry-ai.",
        },
      },
      required: ["slug"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: async (input, { signal }) => {
      const slug = stringParam(input, "slug")
      if (!slug) {
        return textResult("Error: slug kosong. Beri slug artikel, misalnya studi-kasus-laundry-ai.")
      }
      const { ok, status, data } = await fetchJson(
        `/api/webmcp/article?slug=${encodeURIComponent(slug)}`,
        signal,
      )
      if (!ok) {
        return textResult(
          status === 404
            ? `Artikel dengan slug "${slug}" tidak ditemukan. Gunakan search_site untuk mencari slug yang benar.`
            : "Error: gagal memuat artikel saat ini.",
        )
      }
      const article = data as {
        title: string
        excerpt: string
        url: string
        headings: string[]
        preview: string
        previewTruncated: boolean
      }
      const parts = [
        `Judul: ${article.title}`,
        `URL: ${article.url}`,
        article.excerpt ? `Ringkasan: ${article.excerpt}` : "",
        article.headings.length > 0
          ? `Bagian: ${article.headings.join(" | ")}`
          : "",
        `Cuplikan: ${article.preview}${article.previewTruncated ? " (dipotong; buka URL untuk teks lengkap)" : ""}`,
      ].filter(Boolean)
      return textResult(parts.join("\n"))
    },
  },
  {
    name: "list_ai_tools",
    title: "List AI tools",
    description:
      "List AI tools from Agentika's directory with name, tagline, category, pricing, and rating. Optionally filter by category. Returns at most 10 tools.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "Tool category to filter by, for example Writing & Content. Omit to list all categories.",
        },
      },
      required: [],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: async (input, { signal }) => {
      const category = stringParam(input, "category")
      const path = category
        ? `/api/webmcp/tools?category=${encodeURIComponent(category)}`
        : "/api/webmcp/tools"
      const { ok, data } = await fetchJson(path, signal)
      if (!ok) {
        return textResult("Error: gagal memuat direktori tools saat ini.")
      }
      const { tools, total } = data as {
        total: number
        tools: {
          name: string
          tagline: string
          category: string
          pricing: string
          rating: number
          url: string
        }[]
      }
      if (tools.length === 0) {
        return textResult(
          category
            ? `Tidak ada tool pada kategori "${category}". Coba tanpa filter kategori.`
            : "Direktori tools kosong.",
        )
      }
      const lines = tools.map(
        (tool) =>
          `- ${tool.name} (${tool.category}, ${tool.pricing}, ★${tool.rating}) — ${tool.tagline} — ${tool.url}`,
      )
      return textResult(
        `${total} tool ditemukan, menampilkan ${tools.length}:\n${lines.join("\n")}`,
      )
    },
  },
  {
    name: "get_ai_tool",
    title: "Get AI tool",
    description:
      "Get full details of one AI tool from Agentika's directory: description, pricing, rating, features, pros, and cons. Use list_ai_tools first if the slug is unknown.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description:
            "Tool slug, the last part of its /ai-tools/ URL, for example chatgpt.",
        },
      },
      required: ["slug"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: async (input, { signal }) => {
      const slug = stringParam(input, "slug")
      if (!slug) {
        return textResult("Error: slug kosong. Beri slug tool, misalnya chatgpt.")
      }
      const { ok, status, data } = await fetchJson(
        `/api/webmcp/tools/${encodeURIComponent(slug)}`,
        signal,
      )
      if (!ok) {
        return textResult(
          status === 404
            ? `Tool dengan slug "${slug}" tidak ditemukan. Gunakan list_ai_tools untuk mencari slug yang benar.`
            : "Error: gagal memuat detail tool saat ini.",
        )
      }
      const tool = data as {
        name: string
        tagline: string
        category: string
        pricing: string
        rating: number
        description: string
        features: string[]
        pros: string[]
        cons: string[]
        url: string
      }
      const parts = [
        `${tool.name} — ${tool.tagline}`,
        `Kategori: ${tool.category} | Harga: ${tool.pricing} | Rating: ★${tool.rating} | URL: ${tool.url}`,
        `Deskripsi: ${tool.description}`,
        tool.features.length > 0 ? `Fitur: ${tool.features.join("; ")}` : "",
        tool.pros.length > 0 ? `Kelebihan: ${tool.pros.join("; ")}` : "",
        tool.cons.length > 0 ? `Kekurangan: ${tool.cons.join("; ")}` : "",
      ].filter(Boolean)
      return textResult(parts.join("\n"))
    },
  },
  {
    name: "list_learn_lessons",
    title: "List Learn lessons",
    description:
      "List lessons from Agentika's Learn tracks for Indonesian UMKM owners. Optionally filter by track slug: ai-basics, ai-automation, no-code-tools, or prompt-engineering-umkm. Returns at most 15 lessons.",
    inputSchema: {
      type: "object",
      properties: {
        track: {
          type: "string",
          description:
            "Learn track slug: ai-basics, ai-automation, no-code-tools, or prompt-engineering-umkm. Omit to list all tracks.",
        },
      },
      required: [],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: async (input, { signal }) => {
      const track = stringParam(input, "track")
      const path = track
        ? `/api/webmcp/learn?track=${encodeURIComponent(track)}`
        : "/api/webmcp/learn"
      const { ok, data } = await fetchJson(path, signal)
      if (!ok) {
        return textResult("Error: gagal memuat daftar lesson saat ini.")
      }
      const { lessons, total } = data as {
        total: number
        lessons: { trackTitle: string; title: string; url: string }[]
      }
      if (lessons.length === 0) {
        return textResult(
          track
            ? `Tidak ada lesson pada track "${track}". Coba tanpa filter track.`
            : "Daftar lesson kosong.",
        )
      }
      const lines = lessons.map(
        (lesson) => `- ${lesson.title} (${lesson.trackTitle}) — ${lesson.url}`,
      )
      return textResult(
        `${total} lesson ditemukan, menampilkan ${lessons.length}:\n${lines.join("\n")}`,
      )
    },
  },
]

type ModelContextLike = {
  registerTool: (
    tool: WebMCP.ModelContextTool,
    options?: WebMCP.ModelContextRegisterToolOptions,
  ) => Promise<void>
}

/**
 * Spec API lives on document.modelContext; navigator.modelContext is the
 * deprecated alias kept for older Chromium builds. Feature-detect both.
 */
function getModelContext(): ModelContextLike | undefined {
  const doc = document as unknown as { modelContext?: ModelContextLike }
  if (doc.modelContext && typeof doc.modelContext.registerTool === "function") {
    return doc.modelContext
  }
  const nav = navigator as unknown as { modelContext?: ModelContextLike }
  if (nav.modelContext && typeof nav.modelContext.registerTool === "function") {
    return nav.modelContext
  }
  return undefined
}

export function WebMcpTools() {
  useEffect(() => {
    const modelContext = getModelContext()
    if (!modelContext) return
    const controller = new AbortController()
    // Static registration on page load (spec best practice for simple apps).
    // A rejected registration (trial inactive, permission denied) is silent:
    // the site works unchanged without WebMCP.
    Promise.all(
      AGENTIKA_TOOLS.map((tool) =>
        modelContext.registerTool(tool, { signal: controller.signal }),
      ),
    ).catch(() => undefined)
    return () => {
      controller.abort()
    }
  }, [])

  return null
}
