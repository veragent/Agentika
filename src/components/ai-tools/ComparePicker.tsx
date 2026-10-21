"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MAX_COMPARE_TOOLS } from "@/lib/ai-tools"

export interface CompareToolOption {
  slug: string
  name: string
  category: string
}

interface ComparePickerProps {
  tools: CompareToolOption[]
  selected: string[]
}

function buildUrl(slugs: string[]): string {
  if (slugs.length === 0) return "/ai-tools/bandingkan"
  return `/ai-tools/bandingkan?tools=${slugs.join(",")}`
}

/**
 * Pemilih tool untuk halaman bandingkan. Pilihan hidup di query param
 * `?tools=slug1,slug2` supaya URL bisa dibagikan apa adanya.
 */
export function ComparePicker({ tools, selected }: ComparePickerProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const selectedTools = selected
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is CompareToolOption => Boolean(t))
  const available = tools.filter((t) => !selected.includes(t.slug))
  const canAdd = selected.length < MAX_COMPARE_TOOLS

  function add(slug: string) {
    if (!slug || selected.includes(slug) || !canAdd) return
    router.push(buildUrl([...selected, slug]), { scroll: false })
  }

  function remove(slug: string) {
    router.push(buildUrl(selected.filter((s) => s !== slug)), {
      scroll: false,
    })
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {selectedTools.map((tool) => (
          <span
            key={tool.slug}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {tool.name}
            <button
              type="button"
              onClick={() => remove(tool.slug)}
              aria-label={`Hapus ${tool.name} dari perbandingan`}
              className="font-bold leading-none hover:opacity-70"
            >
              ×
            </button>
          </span>
        ))}
        {selectedTools.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Belum ada tool dipilih.
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Tambah tool untuk dibandingkan"
          disabled={!canAdd}
          value=""
          onChange={(e) => add(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border bg-background disabled:opacity-50"
        >
          <option value="">
            {canAdd
              ? `+ Tambah tool (${selected.length}/${MAX_COMPARE_TOOLS})`
              : `Maksimal ${MAX_COMPARE_TOOLS} tool`}
          </option>
          {available.map((tool) => (
            <option key={tool.slug} value={tool.slug}>
              {tool.name} — {tool.category}
            </option>
          ))}
        </select>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={copyLink}
            className="px-3 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
          >
            {copied ? "Link tersalin ✓" : "Salin link perbandingan"}
          </button>
        )}
      </div>
    </div>
  )
}
