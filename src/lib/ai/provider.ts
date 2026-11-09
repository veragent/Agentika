import OpenAI from "openai"
import { env } from "@/lib/env"

/**
 * Provider AI generik (OpenAI-compatible) untuk AI Chat & AI Writer.
 *
 * Konfigurasi sepenuhnya lewat env (lihat .env.example): AI_BASE_URL,
 * AI_API_KEY, AI_MODEL. Ganti provider cukup ganti 3 nilai itu.
 * Default: BeatAPI + deepseek-v4.1-flash-free.
 *
 * Tidak ada key yang di-hardcode di sini. Bila AI_API_KEY kosong,
 * getAiClient() mengembalikan null dan pemanggil memakai mock.
 */

/** Error khusus limit provider (HTTP 429), membawa jeda yang disarankan. */
export class AiRateLimitError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super("Provider AI membatasi permintaan (rate limit).")
    this.name = "AiRateLimitError"
    this.retryAfterSeconds = retryAfterSeconds
  }
}

function parseRetryAfter(error: unknown): number {
  const headers = (error as { headers?: Record<string, string> } | null)?.headers
  const raw =
    headers?.["retry-after"] ??
    headers?.["Retry-After"] ??
    (error as { error?: { retry_after_seconds?: number } } | null)?.error
      ?.retry_after_seconds
  const seconds = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 60
}

/** True bila error berasal dari limit provider (status 429 / kode rate_limit). */
export function isRateLimitError(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status
  const code = (error as { code?: string; error?: { code?: string } } | null)
  return (
    status === 429 ||
    code?.code === "rate_limit_exceeded" ||
    code?.error?.code === "rate_limit_exceeded"
  )
}

/** Ubah error provider apa pun menjadi AiRateLimitError bila itu 429. */
export function toRateLimitError(error: unknown): AiRateLimitError {
  return new AiRateLimitError(parseRetryAfter(error))
}

/** Klien OpenAI-compatible, atau null bila AI_API_KEY belum di-set. */
export function getAiClient(): OpenAI | null {
  if (!env.AI_API_KEY) return null
  return new OpenAI({
    apiKey: env.AI_API_KEY,
    baseURL: env.AI_BASE_URL,
    // Tanpa retry: SDK default mengulang 2x diam-diam saat request
    // menggantung/gagal, membengkakkan TTFB. Rate limit ditangani
    // eksplisit oleh pemanggil (isRateLimitError).
    maxRetries: 0,
  })
}

/** ID model aktif dari env. */
export function getAiModel(): string {
  return env.AI_MODEL
}

/** True bila kill switch menyala DAN provider generik terkonfigurasi. */
export function isAiProviderAvailable(killSwitch: string): boolean {
  return killSwitch === "true" && Boolean(env.AI_API_KEY)
}
