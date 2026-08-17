"use client"

import { useEffect } from "react"
import { env } from "@/lib/env"

export function GoogleAnalytics() {
  const measurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  useEffect(() => {
    if (!measurementId || measurementId === "G-XXXXXXXXXX") {
      return
    }

    // Load gtag script
    const script1 = document.createElement("script")
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script1)

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag
    gtag("js", new Date())
    gtag("config", measurementId, {
      send_page_view: true,
      anonymize_ip: true,
    })

    // Cleanup
    return () => {
      const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [measurementId])

  return null
}

// Type augmentation for gtag
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}