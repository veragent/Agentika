import { z } from "zod"

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "test", "production"]).default("development"),

  // AI Providers lama (legacy) — hanya dipakai pengecekan ketersediaan
  // Prompt Generator; provider generik di atas tidak butuh key-key ini.
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),

  // Provider AI generik (OpenAI-compatible) — dipakai AI Chat & AI Writer.
  // Ganti provider cukup ganti 3 nilai ini, tanpa ubah kode:
  // base URL endpoint chat completions, API key, dan ID model.
  // Default: Hcnsec + MiniMax-M3.1-Flash (gratis di bawah tier 200K
  // per panggilan, limit default 950 req/menit di akun Hcnsec).
  AI_BASE_URL: z.string().url().default("https://api.hcnsec.cn/v1"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("MiniMax-M3.1-Flash"),

  // Upstash Redis (store bersama untuk rate limit + cache respons AI).
  // Kosong = fallback in-memory per instance (rate limit dan cache
  // tetap jalan, tapi tidak berlaku lintas instance serverless).
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // AI Chat Sidebar (kill switch; "true" untuk mengaktifkan)
  AI_CHAT_ENABLED: z.string().default("false"),

  // AdSense
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_GSC_VERIFICATION: z.string().optional(),

  // Resend (email)
  RESEND_API_KEY: z.string().optional(),

  // Newsletter
  NEWSLETTER_PROVIDER: z.enum(["convertkit", "mailerlite", "buttondown", "mailchimp", "resend"]).optional(),
  NEWSLETTER_API_KEY: z.string().optional(),
  NEWSLETTER_FORM_ID: z.string().optional(),
  NEWSLETTER_LIST_ID: z.string().optional(),
  // Alamat pengirim untuk welcome email + digest (harus terverifikasi di Resend)
  NEWSLETTER_FROM_EMAIL: z.string().optional(),

  // Pelindung route cron (digest newsletter); dipakai juga cron eksternal
  CRON_SECRET: z.string().optional(),

  // AI Writer (kill switch; "true" untuk mengaktifkan)
  AI_WRITER_ENABLED: z.string().default("false"),

  // Prompt Generator (kill switch; "true" untuk mengaktifkan)
  PROMPT_GENERATOR_ENABLED: z.string().default("false"),

  // Giscus (komentar blog via GitHub Discussions; kosong = komponen tidak dirender)
  NEXT_PUBLIC_GISCUS_REPO: z.string().optional(),
  NEXT_PUBLIC_GISCUS_REPO_ID: z.string().optional(),
  NEXT_PUBLIC_GISCUS_CATEGORY: z.string().optional(),
  NEXT_PUBLIC_GISCUS_CATEGORY_ID: z.string().optional(),

  // App URL (for sitemap, OG, canonical)
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n")
  console.error(`\n❌ Invalid environment variables:\n${details}\n`)
  throw new Error(`Invalid environment variables:\n${details}`)
}

export const env = parsed.data

export type Env = z.infer<typeof serverEnvSchema>