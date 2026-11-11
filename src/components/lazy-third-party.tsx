"use client"

import { useEffect } from "react"

/**
 * Skrip third-party (AdSense + GA4) dimuat malas: setelah window load dan
 * saat browser idle (requestIdleCallback, fallback timeout 3 detik).
 *
 * Alasan (baseline CWV 11 Nov 2026, Lighthouse 13.6.0 Mobile): adsbygoogle.js
 * ~167 KiB dan gtag.js ~75 KiB tercatat sebagai unused JavaScript di semua
 * halaman dan bersaing dengan LCP di jalur load kritis. Skrip tetap dimuat —
 * bukan dihapus — supaya verifikasi situs AdSense yang sedang berjalan
 * (diajukan 8 Nov) tidak terganggu: crawler Google merender halaman penuh
 * dan tetap menemukan kodenya. Slot iklan tetap dikendalikan adsense.json.
 *
 * Pola antrean AdSense tetap aman: ClientAdSlot melakukan push ke
 * window.adsbygoogle sebelum library termuat, dan library menguras antrean
 * itu saat dimuat. GA4 memakai pola yang sama via dataLayer.
 */
export function LazyThirdPartyScripts({
  adsenseClientId,
  gaId,
}: {
  adsenseClientId?: string
  gaId?: string
}) {
  useEffect(() => {
    const load = () => {
      if (adsenseClientId) {
        const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`
        if (!document.querySelector(`script[src="${src}"]`)) {
          const script = document.createElement("script")
          script.src = src
          script.async = true
          script.crossOrigin = "anonymous"
          document.head.appendChild(script)
        }
      }

      if (gaId) {
        const src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
        if (!document.querySelector(`script[src="${src}"]`)) {
          const script = document.createElement("script")
          script.src = src
          script.async = true
          document.head.appendChild(script)
          const inline = document.createElement("script")
          inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${gaId}');`
          document.head.appendChild(inline)
        }
      }
    }

    const schedule = () => {
      const ric = (
        window as unknown as {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
        }
      ).requestIdleCallback
      if (typeof ric === "function") ric(load, { timeout: 3000 })
      else window.setTimeout(load, 1500)
    }

    if (document.readyState === "complete") schedule()
    else window.addEventListener("load", schedule, { once: true })
  }, [adsenseClientId, gaId])

  return null
}
