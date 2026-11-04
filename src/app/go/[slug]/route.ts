import { NextResponse } from "next/server"
import { getToolBySlug } from "@/lib/ai-tools"

/**
 * Redirect afiliasi internal: GET /go/<slug> -> 302 ke tujuan tool.
 *
 * - Slug tidak dikenal, atau tool tanpa affiliateLink: 404.
 * - Tujuan dipakai persis apa adanya: TIDAK ditambah UTM otomatis,
 *   karena program afiliasi yang menentukan apakah UTM/sub-ID
 *   diizinkan. UTM/sub-ID hanya datang dari link asli program
 *   saat link itu dimasukkan ke field affiliateLink.
 * - Pencatatan klik agregat (GA4 event affiliate_click) belum
 *   terpasang di route server ini; itu langkah berikutnya bila
 *   volume klik sudah nyata, sesuai desain fase 1/2.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool?.affiliateLink) {
    return new NextResponse("Tidak ditemukan", { status: 404 })
  }
  return NextResponse.redirect(tool.affiliateLink, 302)
}
