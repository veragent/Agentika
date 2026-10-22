import { NextResponse } from "next/server"
import { z } from "zod"
import { getLearnPageBySlug } from "@/lib/learn"
import {
  buildSystemPrompt,
  isAiChatAvailable,
  streamLearnChat,
} from "@/lib/ai/chat-provider"
import { checkAiChatRateLimit } from "@/lib/ai/rate-limit"

/**
 * AI Chat Sidebar — Phase 4, Tahap 0 (scaffolding).
 *
 * Konteks lesson SELALU dimuat di server dari slug; client hanya
 * mengirim slug + riwayat pesan, tidak pernah isi lesson.
 * Saat flag AI_CHAT_ENABLED off atau belum ada API key, route ini
 * mengembalikan stream mock deterministik (lihat chat-provider.ts).
 *
 * Desain: ~/workspace/agentika/ai-chat-sidebar-design-2026-10-19.md
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const requestSchema = z.object({
  slug: z.string().min(1).max(200),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500),
      }),
    )
    .max(20),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Request tidak valid" },
      { status: 400 },
    )
  }

  const { slug, messages } = parsed.data

  const clientKey =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rate = checkAiChatRateLimit(clientKey)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error:
          "Terlalu banyak pesan dalam waktu singkat. Tunggu sebentar, lalu coba lagi ya.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    )
  }

  const lesson = await getLearnPageBySlug(slug)
  if (!lesson) {
    return NextResponse.json(
      { error: "Lesson tidak ditemukan" },
      { status: 404 },
    )
  }

  const system = buildSystemPrompt(lesson)
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamLearnChat({ system, messages })) {
          controller.enqueue(encoder.encode(chunk))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-AI-Chat-Mode": isAiChatAvailable() ? "provider" : "mock",
    },
  })
}
