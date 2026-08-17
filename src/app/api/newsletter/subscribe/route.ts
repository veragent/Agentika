import { NextRequest, NextResponse } from "next/server"
import { subscribeToNewsletter } from "@/lib/newsletter"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, tags } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Email tidak valid" }, { status: 400 })
    }

    // Rate limiting sederhana (opsional: pakai Upstash Redis untuk production)
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    console.log(`[Newsletter] Subscribe attempt: ${email} from ${ip}`)

    // Konfigurasi dari env
    const provider = (env.NEWSLETTER_PROVIDER as any) || "convertkit"
    const apiKey = env.NEWSLETTER_API_KEY
    const formId = env.NEWSLETTER_FORM_ID
    const listId = env.NEWSLETTER_LIST_ID

    if (!apiKey) {
      console.error("[Newsletter] API key not configured")
      return NextResponse.json({ success: false, message: "Server belum dikonfigurasi" }, { status: 500 })
    }

    const result = await subscribeToNewsletter(email, name, {
      provider,
      apiKey,
      formId,
      listId,
      tags: tags || ["website", "blog"],
      doubleOptIn: true
    })

    if (result.success) {
      console.log(`[Newsletter] Success: ${email}`)
      return NextResponse.json({ success: true, message: result.message })
    } else {
      console.error(`[Newsletter] Failed: ${email} - ${result.message}`)
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("[Newsletter] Error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}