"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "agentika-learn-progress"
const EVENT_NAME = "agentika:learn-progress-changed"

function readProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function writeProgress(progress: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // abaikan jika storage penuh / tidak tersedia
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

/** Tombol "tandai selesai" di halaman lesson. lessonId = slugPath, mis. "ai-basics/01-pengantar". */
export function MarkCompleteButton({ lessonId }: { lessonId: string }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(!!readProgress()[lessonId])
  }, [lessonId])

  const toggle = useCallback(() => {
    const progress = readProgress()
    const next = !progress[lessonId]
    if (next) {
      progress[lessonId] = true
    } else {
      delete progress[lessonId]
    }
    writeProgress(progress)
    setDone(next)
  }, [lessonId])

  return (
    <Button
      onClick={toggle}
      variant={done ? "secondary" : "default"}
      className={cn("gap-2", done && "text-primary")}
    >
      {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      {done ? "Selesai! Klik untuk batalkan" : "Tandai lesson ini selesai"}
    </Button>
  )
}

/** Progress bar per track di halaman /learn. lessonIds = daftar slug lesson dalam track. */
export function TrackProgressBar({ lessonIds }: { lessonIds: string[] }) {
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    const update = () => {
      const progress = readProgress()
      setCompleted(lessonIds.filter((id) => progress[id]).length)
    }
    update()
    window.addEventListener(EVENT_NAME, update)
    return () => window.removeEventListener(EVENT_NAME, update)
  }, [lessonIds])

  const total = lessonIds.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  if (total === 0) return null

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {completed}/{total} materi selesai
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
