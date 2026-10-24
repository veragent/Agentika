"use client"

import { useEffect, useRef } from "react"

/**
 * Komentar artikel via Giscus (GitHub Discussions) — Phase 5.
 *
 * Komponen ini TIDAK merender apa pun sampai keempat env berikut terisi
 * (ambil nilainya dari https://giscus.app setelah GitHub Discussions
 * aktif di repo dan app Giscus terpasang):
 *   NEXT_PUBLIC_GISCUS_REPO, NEXT_PUBLIC_GISCUS_REPO_ID,
 *   NEXT_PUBLIC_GISCUS_CATEGORY, NEXT_PUBLIC_GISCUS_CATEGORY_ID
 */
export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null)

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID
  const configured = Boolean(repo && repoId && categoryId)

  useEffect(() => {
    if (!configured || !containerRef.current) return
    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.setAttribute("data-repo", repo as string)
    script.setAttribute("data-repo-id", repoId as string)
    script.setAttribute("data-category", category || "General")
    script.setAttribute("data-category-id", categoryId as string)
    script.setAttribute("data-mapping", "pathname")
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "top")
    script.setAttribute("data-theme", "preferred_color_scheme")
    script.setAttribute("data-lang", "id")
    containerRef.current.appendChild(script)
    const container = containerRef.current
    return () => {
      container.innerHTML = ""
    }
  }, [configured, repo, repoId, category, categoryId])

  if (!configured) return null

  return (
    <section aria-label="Komentar pembaca" className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">Diskusi</h2>
      <div ref={containerRef} />
    </section>
  )
}
