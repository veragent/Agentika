import { NextRequest, NextResponse } from "next/server"
import { sendWeeklyDigest } from "@/lib/newsletter-automation"
import { env } from "@/lib/env"

/**
 * Weekly digest newsletter (Phase 5 automation).
 *
 * Dipicu Vercel Cron seminggu sekali (jadwal diatur di dashboard Vercel
 * atau vercel.json) atau manual dengan header:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Tanpa CRON_SECRET route ini menolak semua panggilan (501), dan tanpa
 * konfigurasi Resend yang lengkap digest tidak terkirim (501 dengan
 * alasan), jadi route aman dipasang sebelum automation diaktifkan.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function handle(request: NextRequest) {
  if (!env.CRON_SECRET) {
    return NextResponse.json({ success: false, message: "CRON_SECRET belum diatur" }, { status: 501 })
  }
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Tidak terotorisasi" }, { status: 401 })
  }

  const result = await sendWeeklyDigest()
  if (!result.sent) {
    const status = result.reason === "not-configured" || result.reason === "audience-not-configured" ? 501 : 502
    return NextResponse.json({ success: false, message: `Digest tidak terkirim: ${result.reason}` }, { status })
  }
  return NextResponse.json({ success: true, broadcastId: result.id, postCount: result.postCount })
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
