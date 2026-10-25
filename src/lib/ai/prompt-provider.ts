import { env } from "@/lib/env"

/**
 * Pembungkus tunggal untuk Prompt Generator (Phase 4): menyusun prompt
 * siap pakai dari kebutuhan usaha, untuk membantu pelaku UMKM memakai
 * AI tanpa harus pandai merangkai prompt.
 *
 * Mengikuti pola writer-provider.ts: UI dan API route TIDAK PERNAH
 * mengimpor vendor SDK langsung. Tahap scaffold ini hanya menyediakan
 * provider mock deterministik (mode demo) yang menyusun kerangka prompt
 * dari input pengguna, tanpa panggilan AI berbayar. Saat API key + ACC
 * budget tersedia, hanya file ini yang berubah ke provider nyata.
 *
 * Hasil generator SELALU kerangka: pengguna tetap harus menyesuaikan
 * dan memeriksa hasil AI sebelum dipakai, dan tidak boleh menempel data
 * pribadi pelanggan ke layanan AI publik.
 */

export interface PromptRequest {
  business: string
  need: string
  goal?: string
  tone?: "santai" | "formal" | "praktis"
}

export interface GeneratedPrompt {
  prompt: string
  variations: string[]
  tips: string[]
  mode: "demo" | "live"
}

/** True bila kill switch menyala DAN minimal satu API key provider tersedia. */
export function isPromptGeneratorAvailable(): boolean {
  return (
    env.PROMPT_GENERATOR_ENABLED === "true" &&
    Boolean(env.GOOGLE_AI_API_KEY || env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GROQ_API_KEY)
  )
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Provider mock deterministik: menyusun kerangka prompt dari input.
 * Tidak mengarang fakta, angka, atau klaim soal usaha pengguna —
 * semua bagian yang butuh data nyata ditandai sebagai tempat isi.
 */
export function generateMockPrompt(request: PromptRequest): GeneratedPrompt {
  const business = request.business.trim()
  const need = request.need.trim()
  const goal = request.goal?.trim() || ""
  const tone = request.tone ?? "praktis"

  const toneLine =
    tone === "formal"
      ? "Gunakan bahasa formal yang sopan, tanpa singkatan."
      : tone === "santai"
        ? "Gunakan bahasa santai sehari-hari, seperti mengobrol dengan pelanggan."
        : "Gunakan bahasa praktis dan langsung ke intinya, tanpa basa-basi."

  const prompt = [
    `Saya pemilik ${business}.`,
    `Buatkan ${need}.`,
    goal ? `Tujuannya: ${goal}.` : "",
    toneLine,
    "Hasilnya harus spesifik dan bisa langsung dipakai, bukan nasihat umum.",
    "[Isi detail usaha Anda di sini sebelum mengirim: produk/jasa utama, harga, dan siapa pembelinya.]",
  ]
    .filter(Boolean)
    .join(" ")

  const variations = [
    `Versi singkat untuk media sosial: ${capitalize(need)} untuk ${business}, ${tone === "formal" ? "nada formal" : tone === "santai" ? "nada santai" : "langsung ke intinya"}.`,
    `Versi detail: ${capitalize(need)} untuk ${business} beserta langkah-langkahnya, ${goal ? `agar ${goal}` : "agar mudah diikuti"}.`,
    `Versi perbaikan: perbaiki draf ${need} saya untuk ${business} ini — [tempel draf Anda] — supaya lebih jelas dan meyakinkan.`,
  ]

  const tips = [
    "Ganti bagian dalam kurung siku dengan data usaha Anda sendiri sebelum mengirim.",
    "Baca hasil AI dan ubah bagian yang tidak terasa seperti gaya bicara Anda.",
    "Jangan menempel data pribadi pelanggan (nama, nomor telepon, alamat) ke layanan AI publik.",
  ]

  return { prompt, variations, tips, mode: "demo" }
}

/**
 * Titik masuk tunggal Prompt Generator. Selama provider nyata belum
 * dipasang, selalu mengembalikan prompt mock dengan mode "demo", apa
 * pun status kill switch (route yang menegakkan kill switch untuk publik).
 */
export async function generatePrompt(request: PromptRequest): Promise<GeneratedPrompt> {
  return generateMockPrompt(request)
}
