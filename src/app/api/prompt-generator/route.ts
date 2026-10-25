import { NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/lib/env"
import { generatePrompt } from "@/lib/ai/prompt-provider"
import { checkAiChatRateLimit } from "@/lib/ai/rate-limit"

/**
 * Prompt Generator — Phase 4 (scaffolding).
 *
 * Menyusun prompt siap pakai dari kebutuhan usaha. Selama kill switch
 * PROMPT_GENERATOR_ENABLED belum "true", route ini nonaktif (404)
 * supaya tidak terekspos publik sebelum ada keputusan biaya. Saat aktif
 * pun, selama provider nyata belum dipasang, hasilnya kerangka mode
 * demo dari provider mock (lihat prompt-provider.ts) dan respons
 * menandainya dengan jelas lewat field mode.
 *
 * Hasil route ini adalah kerangka: pengguna tetap harus menyesuaikan
 * dan memeriksa hasil AI sebelum dipakai.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const requestSchema = z.object({
  business: z.string().min(3).max(120),
  need: z.string().min(3).max(200),
  goal: z.string().min(1).max(200).optional(),
  tone: z.enum(["santai", "formal", "praktis"]).optional(),
})

export async function POST(req: Request) {
  if (env.PROMPT_GENERATOR_ENABLED !== "true") {
    return NextResponse.json({ error: "Fitur belum aktif" }, { status: 404 })
  }

  const json = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 })
  }

  const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rate = checkAiChatRateLimit(clientKey)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan dalam waktu singkat. Tunggu sebentar, lalu coba lagi ya." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    )
  }

  const result = await generatePrompt(parsed.data)
  return NextResponse.json(result)
}
