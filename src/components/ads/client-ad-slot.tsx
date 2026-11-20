"use client"

import { useEffect, useRef, useState } from "react"

type ClientAdSlotProps = {
  clientId: string
  slotId: string
  label?: string
  format?: "auto" | "rectangle" | "horizontal"
  className?: string
  wrapperClassName?: string
}

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function ClientAdSlot({
  clientId,
  slotId,
  label = "Sponsored",
  format = "auto",
  className,
  wrapperClassName,
}: ClientAdSlotProps) {
  const insRef = useRef<HTMLModElement | null>(null)
  const [adStatus, setAdStatus] = useState<"loading" | "filled" | "unfilled">("loading")

  useEffect(() => {
    const el = insRef.current
    if (!el) return

    const observer = new MutationObserver(() => {
      const status = el.getAttribute("data-ad-status")
      if (status === "filled" || status === "unfilled") {
        setAdStatus(status)
      }
    })

    observer.observe(el, { attributes: true, attributeFilter: ["data-ad-status"] })

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      setAdStatus("unfilled")
    }

    return () => observer.disconnect()
  }, [slotId])

  if (adStatus === "unfilled") {
    return null
  }

  return (
    <div className={adStatus === "filled" ? wrapperClassName : "hidden"}>
      {adStatus === "filled" && (
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      )}
      <ins
        ref={insRef}
        className={`adsbygoogle block ${className ?? ""}`}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        aria-label="Advertisement"
      />
    </div>
  )
}
