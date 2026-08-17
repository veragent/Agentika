import { z } from "zod"

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "test", "production"]).default("development"),

  // AI Providers (at least one recommended)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),

  // AdSense
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  NEXT_PUBLIC_UMAMI_URL: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_GSC_VERIFICATION: z.string().optional(),

  // Resend (email)
  RESEND_API_KEY: z.string().optional(),

  // Discord
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  DISCORD_BOT_TOKEN: z.string().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),
  TELEGRAM_ANNOUNCEMENTS_CHANNEL_ID: z.string().optional(),

  // Newsletter
  NEWSLETTER_PROVIDER: z.enum(["convertkit", "mailerlite", "buttondown", "mailchimp"]).optional(),
  NEWSLETTER_API_KEY: z.string().optional(),
  NEWSLETTER_FORM_ID: z.string().optional(),
  NEWSLETTER_LIST_ID: z.string().optional(),

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