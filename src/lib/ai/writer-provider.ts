import { env } from "@/lib/env"

/**
 * Pembungkus tunggal untuk AI Writer (Phase 4): generate draf artikel
 * dari topik untuk membantu ritme editorial Agentika.
 *
 * Mengikuti pola chat-provider.ts: UI dan API route TIDAK PERNAH
 * mengimpor vendor SDK langsung. Tahap scaffold ini hanya menyediakan
 * provider mock deterministik (mode demo) yang menyusun kerangka
 * artikel dari topik, tanpa panggilan AI berbayar. Saat API key + ACC
 * budget tersedia, hanya file ini yang berubah ke provider nyata.
 *
 * Hasil writer SELALU draf: wajib melewati review manusia + audit
 * humanizer sebelum diterbitkan, sama seperti alur artikel manual.
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
}

/** True bila kill switch menyala DAN minimal satu API key provider tersedia. */
export function isAiWriterAvailable(): boolean {
  return (
    env.AI_WRITER_ENABLED === "true" &&
    Boolean(env.GOOGLE_AI_API_KEY || env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GROQ_API_KEY)
  )
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

/**
 * Titik masuk tunggal AI Writer. Selama provider nyata belum dipasang,
 * selalu mengembalikan draf mock dengan mode "demo", apa pun status
 * kill switch (route yang menegakkan kill switch untuk publik).
 */
export async function generateArticleDraft(request: WriterRequest): Promise<WriterDraft> {
  return generateMockDraft(request)
}
