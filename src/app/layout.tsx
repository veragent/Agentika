import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { BRAND } from "@/lib/brand"
import { Providers } from "@/components/providers"
import { WebMcpTools } from "@/components/webmcp-tools"
import { LazyThirdPartyScripts } from "@/components/lazy-third-party"
import { getAdSettings } from "@/lib/ads"
import { WEBMCP_ORIGIN_TRIAL_TOKEN } from "@/lib/origin-trial"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.agentika.web.id"

// GA4 Measurement ID — public client-side ID (bukan secret).
// Fallback hardcode supaya analytics tetap jalan walau env belum ke-set di platform.
const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID ??
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
  "G-CF8K7Z0DVD"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: `${BRAND.name} — Platform AI untuk UMKM Indonesia`,
  description: "Tools AI, tutorial otomatisasi, dan strategi side hustle untuk bisnis online Indonesia.",
  applicationName: BRAND.descriptor,
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": `${APP_URL}/en`,
      "id-ID": `${APP_URL}/id`,
      "x-default": APP_URL,
    },
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Client ID AdSense untuk lazy loader skrip third-party di bawah.
  // Slot manual tetap dikendalikan adsense.json (globallyEnabled + slotId).
  const adSettings = getAdSettings()
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta httpEquiv="origin-trial" content={WEBMCP_ORIGIN_TRIAL_TOKEN} />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://og-images.pearlanalytics.ai" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <WebMcpTools />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
      {/* Skrip third-party dimuat malas (setelah window load + idle):
          baseline CWV 11 Nov 2026 — AdSense ~167 KiB dan GTM ~75 KiB
          tercatat sebagai unused JavaScript saat load. Kode tetap dimuat
          (bukan dihapus) supaya verifikasi situs AdSense yang sedang
          berjalan tidak terganggu; slot iklan tetap dikendalikan
          adsense.json (globallyEnabled + slotId). */}
      <LazyThirdPartyScripts
        adsenseClientId={adSettings.clientId || undefined}
        gaId={GA_ID}
      />
    </html>
  )
}