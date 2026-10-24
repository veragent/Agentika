import { env } from "@/lib/env"
import { getPublishedBlogPosts } from "@/lib/blog"
import type { PostMetadata } from "@/lib/mdx"

/**
 * Newsletter automation (Phase 5): welcome email + weekly digest via Resend.
 *
 * Semua fungsi di file ini INERT sampai konfigurasi lengkap tersedia:
 *   - RESEND_API_KEY (atau NEWSLETTER_API_KEY saat provider = resend)
 *   - NEWSLETTER_FROM_EMAIL, alamat pengirim terverifikasi di Resend,
 *     contoh: "Agentika <halo@agentika.web.id>"
 *   - NEWSLETTER_LIST_ID, ID Audience Resend (untuk digest)
 *
 * Tanpa konfigurasi itu, fungsi mengembalikan status "not-configured"
 * dan TIDAK melempar error, supaya alur subscribe dan route digest
 * tidak pernah rusak hanya karena automation belum diaktifkan.
 */

const RESEND_API_BASE = "https://api.resend.com"

export interface AutomationResult {
  sent: boolean
  reason?: string
  id?: string
}

function getResendApiKey(): string | undefined {
  if (env.RESEND_API_KEY) return env.RESEND_API_KEY
  if (env.NEWSLETTER_PROVIDER === "resend") return env.NEWSLETTER_API_KEY
  return undefined
}

export function isNewsletterAutomationConfigured(): boolean {
  return Boolean(getResendApiKey() && env.NEWSLETTER_FROM_EMAIL)
}

function getBaseUrl(): string {
  return env.NEXT_PUBLIC_APP_URL || "https://www.agentika.web.id"
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

type ResendResponse = { id?: string; message?: string } & Record<string, unknown>

async function resendPost(path: string, apiKey: string, payload: unknown): Promise<{ ok: boolean; data: ResendResponse }> {
  const res = await fetch(`${RESEND_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

/**
 * Kirim email sambutan ke subscriber baru. Dipanggil dari route subscribe
 * SETELAH subscribe berhasil; kegagalan di sini tidak menggagalkan subscribe.
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<AutomationResult> {
  const apiKey = getResendApiKey()
  const from = env.NEWSLETTER_FROM_EMAIL
  if (!apiKey || !from) return { sent: false, reason: "not-configured" }

  const base = getBaseUrl()
  const sapaan = name ? `Halo ${escapeHtml(name)},` : "Halo,"
  const subject = "Selamat datang di newsletter Agentika"
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>${sapaan}</p>
      <p>Terima kasih sudah berlangganan newsletter Agentika. Setiap minggu kami
      mengirim rangkuman praktis seputar AI dan otomatisasi untuk UMKM dan
      side hustle di Indonesia: artikel baru, tool yang layak dicoba, dan
      contoh pemakaian nyata di usaha kecil.</p>
      <p>Mulai dari sini:</p>
      <ul>
        <li><a href="${base}/blog">Artikel terbaru di blog</a></li>
        <li><a href="${base}/ai-tools">Direktori AI tools dengan ulasan fitur dan harga</a></li>
        <li><a href="${base}/learn">Materi belajar AI untuk pemula</a></li>
      </ul>
      <p>Salam,<br/>Tim Agentika</p>
    </div>`
  const text = [
    sapaan,
    "",
    "Terima kasih sudah berlangganan newsletter Agentika. Setiap minggu kami mengirim rangkuman praktis seputar AI dan otomatisasi untuk UMKM dan side hustle di Indonesia.",
    "",
    `Artikel terbaru: ${base}/blog`,
    `Direktori AI tools: ${base}/ai-tools`,
    `Materi belajar: ${base}/learn`,
    "",
    "Salam,",
    "Tim Agentika",
  ].join("\n")

  try {
    const { ok, data } = await resendPost("/emails", apiKey, { from, to: [email], subject, html, text })
    if (!ok) {
      console.error("[NewsletterAutomation] Welcome email failed:", data)
      return { sent: false, reason: data?.message || "resend-error" }
    }
    return { sent: true, id: data?.id }
  } catch (error) {
    console.error("[NewsletterAutomation] Welcome email error:", error)
    return { sent: false, reason: "exception" }
  }
}

export interface DigestContent {
  subject: string
  html: string
  text: string
  postCount: number
}

/** Susun isi digest mingguan dari artikel terbit terbaru. Fungsi murni, bisa dites. */
export function buildDigestContent(posts: PostMetadata[], limit = 5): DigestContent {
  const base = getBaseUrl()
  const latest = posts.slice(0, limit)
  const subject = `Rangkuman mingguan Agentika: ${latest[0]?.title ?? "artikel terbaru"}`

  const itemsHtml = latest
    .map((post) => {
      const url = `${base}/blog/${post.slug}`
      const excerpt = post.excerpt ? `<p style="margin: 4px 0 0;">${escapeHtml(post.excerpt)}</p>` : ""
      return `<li style="margin-bottom: 16px;"><a href="${url}"><strong>${escapeHtml(post.title)}</strong></a>${excerpt}</li>`
    })
    .join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>Halo,</p>
      <p>Ini rangkuman artikel terbaru di Agentika minggu ini:</p>
      <ul>${itemsHtml}</ul>
      <p>Semua artikel: <a href="${base}/blog">${base}/blog</a></p>
      <p>Salam,<br/>Tim Agentika</p>
    </div>`

  const textLines = latest.map((post) => `- ${post.title}\n  ${base}/blog/${post.slug}`)
  const text = ["Halo,", "", "Ini rangkuman artikel terbaru di Agentika minggu ini:", "", ...textLines, "", "Salam,", "Tim Agentika"].join("\n")

  return { subject, html, text, postCount: latest.length }
}

/**
 * Buat broadcast Resend berisi digest mingguan lalu kirim ke Audience.
 * Dipanggil route /api/newsletter/digest (dilindungi CRON_SECRET),
 * dirancang untuk dipicu Vercel Cron seminggu sekali.
 */
export async function sendWeeklyDigest(limit = 5): Promise<AutomationResult & { postCount?: number }> {
  const apiKey = getResendApiKey()
  const from = env.NEWSLETTER_FROM_EMAIL
  const audienceId = env.NEWSLETTER_LIST_ID || env.NEWSLETTER_FORM_ID
  if (!apiKey || !from) return { sent: false, reason: "not-configured" }
  if (!audienceId) return { sent: false, reason: "audience-not-configured" }

  const posts = getPublishedBlogPosts()
  if (posts.length === 0) return { sent: false, reason: "no-posts" }
  const digest = buildDigestContent(posts, limit)

  try {
    const created = await resendPost("/broadcasts", apiKey, {
      audience_id: audienceId,
      from,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
      name: `Digest mingguan ${new Date().toISOString().slice(0, 10)}`,
    })
    if (!created.ok || !created.data?.id) {
      console.error("[NewsletterAutomation] Broadcast create failed:", created.data)
      return { sent: false, reason: created.data?.message || "broadcast-create-error" }
    }
    const sentRes = await resendPost(`/broadcasts/${created.data.id}/send`, apiKey, {})
    if (!sentRes.ok) {
      console.error("[NewsletterAutomation] Broadcast send failed:", sentRes.data)
      return { sent: false, reason: sentRes.data?.message || "broadcast-send-error", id: created.data.id }
    }
    return { sent: true, id: created.data.id, postCount: digest.postCount }
  } catch (error) {
    console.error("[NewsletterAutomation] Digest error:", error)
    return { sent: false, reason: "exception" }
  }
}
