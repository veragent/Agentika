import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** Security headers applied to every response */
const SECURITY_HEADERS = {
  "X-DNS-Prefetch-Control": "on",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://og-images.pearlanalytics.ai https://*.vercel.app https://*.amazonaws.com https://images.unsplash.com",
    "connect-src 'self' https://api.coingecko.com https://*.vercel.app wss:",
    "frame-src 'self' https://www.youtube.com https://www.googletagmanager.com",
    "frame-ancestors 'none'",
  ].join("; "),
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  const newResponse = new NextResponse(response.body, response)
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newResponse.headers.set(key, value)
  }
  newResponse.headers.set("X-Content-Type-Options", "nosniff")
  return newResponse
}

export async function proxy(request: NextRequest) {
  const res = NextResponse.next()
  return applySecurityHeaders(res)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}