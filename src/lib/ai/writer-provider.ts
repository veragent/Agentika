import { env } from "@/lib/env"
import {
  getAiClient,
  getAiModel,
  isAiProviderAvailable,
  isRateLimitError,
  toRateLimitError,
} from "@/lib/ai/provider"
import { cacheGet, cacheSet, hashKey } from "@/lib/cache/redis"

/**
 * Pembungkus tunggal untuk AI Writer (Phase 4): generate draf artikel
 * dari topik untuk membantu ritme editorial Agentika.
 *
 * Mengikuti pola chat-provider.ts: UI dan API route TIDAK PERNAH
 * mengimpor vendor SDK langsung. Provider nyata memakai provider AI
 * generik (OpenAI-compatible) dari env: AI_BASE_URL, AI_API_KEY,
 * AI_MODEL (default BeatAPI + deepseek-v4.1-flash-free, gratis).
 * Bila key belum di-set, kembali ke mock deterministik (mode demo).
 *
 * Hasil writer SELALU draf: wajib melewati review manusia + audit
 * humanizer sebelum diterbitkan, sama seperti alur artikel manual.
 * Model diinstruksikan untuk TIDAK mengarang fakta, angka, nama tool,
 * atau harga — klaim yang tidak yakin ditulis sebagai placeholder
 * [perlu verifikasi] untuk diisi penulis manusia.
 */

export interface WriterRequest {
  topic: string
  audience?: string
  tone?: "santai" | "formal" | "praktis"
  keywords?: string[]
}

export interface WriterDraft {
  titleSuggestions: string[]
  outline: string[]
  draftMarkdown: string
  mode: "demo" | "live"
  /** True bila draf diambil dari cache (tanpa panggilan provider baru). */
  cached?: boolean
}

/** True bila kill switch menyala DAN provider AI generik terkonfigurasi. */
export function isAiWriterAvailable(): boolean {
  return isAiProviderAvailable(env.AI_WRITER_ENABLED)
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Provider mock deterministik: menyusun kerangka artikel dari topik.
 * Tidak mengarang fakta, angka, atau nama tool — bagian isi ditandai
 * jelas sebagai tempat yang harus diisi penulis manusia.
 */
export function generateMockDraft(request: WriterRequest): WriterDraft {
  const topic = request.topic.trim()
  const audience = request.audience?.trim() || "pelaku UMKM Indonesia"
  const keywords = (request.keywords ?? []).filter(Boolean)

  const titleSuggestions = [
    capitalize(topic),
    `${capitalize(topic)}: panduan praktis untuk ${audience}`,
    keywords[0] ? `${capitalize(topic)} dengan ${keywords[0]}: mulai dari mana?` : `${capitalize(topic)}: langkah awal yang realistis`,
  ]

  const outline = [
    "Pembuka: masalah nyata yang dihadapi pembaca terkait topik ini",
    "Kenapa topik ini penting sekarang (konteks singkat, tanpa hype)",
    "Langkah-langkah praktis yang bisa dilakukan hari ini",
    "Contoh penerapan di usaha kecil (warung, kuliner, jasa, atau toko online)",
    "Kesalahan umum yang perlu dihindari",
    "Penutup: satu aksi kecil untuk memulai",
  ]

  const keywordLine = keywords.length > 0 ? `\nKata kunci yang perlu muncul alami di teks: ${keywords.join(", ")}.` : ""

  const draftMarkdown = [
    `# ${titleSuggestions[0]}`,
    "",
    `> DRAF MODE DEMO — kerangka ini disusun otomatis dari topik, bukan hasil riset.`,
    `> Semua klaim, angka, dan contoh wajib diverifikasi dan ditulis ulang penulis manusia sebelum terbit.${keywordLine}`,
    "",
    "## Pembuka",
    "",
    `[Tulis masalah nyata yang dihadapi ${audience} terkait "${topic}". Satu atau dua paragraf, bahasa sehari-hari.]`,
    "",
    "## Kenapa ini penting",
    "",
    "[Jelaskan konteksnya secara singkat. Hindari klaim bombastis; bila menyebut tren atau angka, cantumkan sumbernya.]",
    "",
    "## Langkah-langkah praktis",
    "",
    "1. [Langkah pertama yang paling mudah dilakukan hari ini]",
    "2. [Langkah kedua, sertakan tool atau cara manualnya]",
    "3. [Langkah ketiga, cara mengecek hasilnya]",
    "",
    "## Contoh penerapan",
    "",
    "[Satu contoh konkret di usaha kecil: situasi awal, yang dilakukan, dan hasil yang terukur.]",
    "",
    "## Kesalahan umum",
    "",
    "- [Kesalahan 1 dan cara menghindarinya]",
    "- [Kesalahan 2 dan cara menghindarinya]",
    "",
    "## Penutup",
    "",
    "[Tutup dengan satu aksi kecil yang bisa dilakukan pembaca hari ini juga.]",
    "",
  ].join("\n")

  return { titleSuggestions, outline, draftMarkdown, mode: "demo" }
}

const WRITER_SYSTEM_PROMPT = `Kamu membantu penulis Agentika menyusun DRAF artikel untuk pelaku UMKM Indonesia.
Bahasa Indonesia sederhana dan praktis, contoh konkret usaha kecil (warung, kuliner, jasa, toko online).
JANGAN mengarang fakta, angka, nama tool, harga, atau alamat. Bila tidak yakin, tulis placeholder [perlu verifikasi] dan biarkan penulis manusia mengisinya.
Balas HANYA dengan objek JSON valid (tanpa pagar kode, tanpa teks lain) berbentuk:
{"titleSuggestions": ["judul 1", "judul 2", "judul 3"], "outline": ["bagian 1", "bagian 2"], "draftMarkdown": "draf artikel lengkap dalam markdown"}
Draf memakai struktur: pembuka, kenapa penting, langkah praktis, contoh penerapan, kesalahan umum, penutup dengan satu aksi kecil.`

function buildWriterUserPrompt(request: WriterRequest): string {
  const parts = [
    `Topik: ${request.topic}`,
    `Audiens: ${request.audience?.trim() || "pelaku UMKM Indonesia"}`,
    `Tone: ${request.tone ?? "praktis"}`,
  ]
  if (request.keywords?.length) {
    parts.push(`Kata kunci yang perlu muncul alami di teks: ${request.keywords.join(", ")}.`)
  }
  return parts.join("\n")
}

function parseWriterJson(text: string): {
  titleSuggestions?: unknown
  outline?: unknown
  draftMarkdown?: unknown
} | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as {
      titleSuggestions?: unknown
      outline?: unknown
      draftMarkdown?: unknown
    }
  } catch {
    return null
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.length > 0)
    : []
}

/**
 * Titik masuk tunggal AI Writer. Bila provider generik tersedia, draf
 * dibuat model (mode "live"); bila belum, draf mock (mode "demo").
 * Kill switch ditegakkan route, bukan di sini.
 * Limit provider (429) dilempar sebagai AiRateLimitError agar route
 * bisa menjawab 429 dengan Retry-After; error lain jatuh ke mock demo.
 */
export async function generateArticleDraft(request: WriterRequest): Promise<WriterDraft> {
  const client = getAiClient()
  if (!client) return generateMockDraft(request)
  // Cache hanya untuk hasil live: draf demo tidak butuh biaya, jadi
  // tidak ada yang dihemat dengan men-cache-nya. Kunci mencakup model
  // agar ganti model tidak mengembalikan draf model lain.
  const cacheKey = hashKey("ai:writer", [
    getAiModel(),
    buildWriterUserPrompt(request),
  ])
  const cached = await cacheGet<WriterDraft>(cacheKey)
  if (cached && cached.mode === "live") {
    return { ...cached, cached: true }
  }
  try {
    // Batas waktu eksplisit: tanpa ini, panggilan provider yang menggantung
    // (teramati di Workers: tidak ada respons > 4 menit) membuat route ikut
    // menggantung selamanya. Timeout di sini melempar AbortError, yang
    // ditangkap di bawah dan jatuh ke draf mock — sesuai desain fallback.
    const completion = await client.chat.completions.create(
      {
        model: getAiModel(),
        messages: [
          { role: "system", content: WRITER_SYSTEM_PROMPT },
          { role: "user", content: buildWriterUserPrompt(request) },
        ],
        max_tokens: 4000,
      },
      { signal: AbortSignal.timeout(90_000) },
    )
    const text = completion.choices[0]?.message?.content ?? ""
    const parsed = parseWriterJson(text)
    if (!parsed) {
      const draft: WriterDraft = {
        titleSuggestions: [capitalize(request.topic.trim())],
        outline: generateMockDraft(request).outline,
        draftMarkdown: text || generateMockDraft(request).draftMarkdown,
        mode: "live",
      }
      await cacheSet(cacheKey, draft, 3600)
      return draft
    }
    const titleSuggestions = toStringArray(parsed.titleSuggestions)
    const outline = toStringArray(parsed.outline)
    const draftMarkdown =
      typeof parsed.draftMarkdown === "string" && parsed.draftMarkdown.length > 0
        ? parsed.draftMarkdown
        : text
    const draft: WriterDraft = {
      titleSuggestions: titleSuggestions.length > 0 ? titleSuggestions : [capitalize(request.topic.trim())],
      outline: outline.length > 0 ? outline : generateMockDraft(request).outline,
      draftMarkdown,
      mode: "live",
    }
    await cacheSet(cacheKey, draft, 3600)
    return draft
  } catch (error) {
    if (isRateLimitError(error)) throw toRateLimitError(error)
    return generateMockDraft(request)
  }
}
