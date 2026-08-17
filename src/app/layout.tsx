import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { BRAND } from "@/lib/brand"
import { Providers } from "@/components/providers"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://agentika.my.id"

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
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
            {children}
            <GoogleAnalytics />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}