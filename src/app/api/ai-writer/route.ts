import { NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/lib/env"
import { generateArticleDraft } from "@/lib/ai/writer-provider"
import { AiRateLimitError } from "@/lib/ai/provider"
import { checkAiRateLimit } from "@/lib/ai/rate-limit"

/**
 * AI Writer — Phase 4 (scaffolding).
 *
 * Menghasilkan kerangka draf artikel dari topik. Selama kill switch
 * AI_WRITER_ENABLED belum "true", route ini nonaktif (404) supaya
 * tidak terekspos publik. Saat aktif, draf dibuat provider AI generik
 * dari env (AI_BASE_URL, AI_API_KEY, AI_MODEL); bila key belum di-set,
 * hasilnya draf mode demo dari provider mock (lihat writer-provider.ts)
 * dan respons menandainya dengan jelas lewat field mode.
 *
 * Hasil route ini adalah bahan mentah editorial: wajib review manusia
 * + audit humanizer sebelum terbit.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const requestSchema = z.object({
  topic: z.string().min(3).max(200),
  audience: z.string().min(1).max(120).optional(),
  tone: z.enum(["santai", "formal", "praktis"]).optional(),
  keywords: z.array(z.string().min(1).max(40)).max(8).optional(),
})

export async function POST(req: Request) {
  if (env.AI_WRITER_ENABLED !== "true") {
    return NextResponse.json({ error: "Fitur belum aktif" }, { status: 404 })
  }

  const json = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 })
  }

  const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rate = await checkAiRateLimit(clientKey)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan dalam waktu singkat. Tunggu sebentar, lalu coba lagi ya." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    )
  }

  try {
    const draft = await generateArticleDraft(parsed.data)
    return NextResponse.json(draft)
  } catch (error) {
    if (error instanceof AiRateLimitError) {
      return NextResponse.json(
        { error: "Batas permintaan AI sedang tercapai (model gratis dibatasi 1 permintaan per menit). Tunggu sebentar, lalu coba lagi ya." },
        { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } },
      )
    }
    throw error
  }
}
