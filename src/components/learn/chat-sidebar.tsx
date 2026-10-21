"use client"

import { useEffect, useRef, useState } from "react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatSidebarProps {
  slug: string
  lessonTitle: string
}

const SUGGESTIONS = [
  "Ringkas poin utama lesson ini",
  "Beri contoh penerapannya untuk usaha kecil",
  "Apa langkah pertama yang harus saya lakukan?",
]

const MAX_MESSAGE_CHARS = 500
const MAX_HISTORY = 20

function ChatPanel({
  messages,
  input,
  loading,
  mode,
  error,
  lessonTitle,
  onInputChange,
  onSend,
  onSuggestion,
}: {
  messages: ChatMessage[]
  input: string
  loading: boolean
  mode: string | null
  error: string | null
  lessonTitle: string
  onInputChange: (value: string) => void
  onSend: () => void
  onSuggestion: (text: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="flex h-full flex-col rounded-xl border bg-background">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold flex items-center gap-2">
          Tanya AI tentang lesson ini
          {mode === "mock" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-yellow-300 bg-yellow-50 text-yellow-700 font-medium">
              Mode demo
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {lessonTitle}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-48">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Tanya apa saja seputar materi lesson ini. Jawaban dibuat hanya
              dari isi lesson.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestion(s)}
                  className="text-left text-sm px-3 py-2 rounded-lg border hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "ml-8 rounded-lg bg-primary/10 px-3 py-2 text-sm whitespace-pre-wrap"
                : "mr-4 rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap"
            }
          >
            {msg.content || (loading ? "Menulis jawaban…" : "")}
          </div>
        ))}
      </div>

      {error && (
        <p className="px-4 pb-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <form
        className="border-t p-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
      >
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          maxLength={MAX_MESSAGE_CHARS}
          rows={2}
          placeholder="Tulis pertanyaanmu…"
          aria-label="Tulis pertanyaan tentang lesson ini"
          className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="self-end px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  )
}

/**
 * AI Chat Sidebar (Phase 4). Desktop xl+: kolom ketiga sticky di samping
 * lesson. Di bawah xl: tombol melayang + drawer. State chat dibagi untuk
 * kedua tampilan. Konteks lesson dimuat di server oleh /api/learn-chat;
 * client hanya mengirim slug + riwayat pesan.
 */
export function ChatSidebar({ slug, lessonTitle }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function send(rawText?: string) {
    const text = (rawText ?? input).trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: "user", content: text }
    const history = [...messages, userMsg].slice(-MAX_HISTORY)
    setMessages([...history, { role: "assistant", content: "" }])
    setInput("")
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/learn-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages: history }),
      })
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }
      setMode(res.headers.get("X-AI-Chat-Mode"))

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        const snapshot = acc
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: "assistant", content: snapshot }
          return next
        })
      }
    } catch {
      setMessages((prev) => prev.slice(0, -1))
      setError("Maaf, terjadi gangguan. Coba lagi sebentar lagi ya.")
    } finally {
      setLoading(false)
    }
  }

  const panelProps = {
    messages,
    input,
    loading,
    mode,
    error,
    lessonTitle,
    onInputChange: setInput,
    onSend: () => void send(),
    onSuggestion: (text: string) => void send(text),
  }

  return (
    <>
      {/* Desktop: kolom ketiga sticky */}
      <aside className="hidden xl:block py-6">
        <div className="sticky top-24 h-[560px]">
          <ChatPanel {...panelProps} />
        </div>
      </aside>

      {/* Mobile/tablet: FAB + drawer */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Buka tanya jawab AI"
        className="xl:hidden fixed bottom-20 right-4 z-40 rounded-full bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow-lg"
      >
        Tanya AI
      </button>
      {drawerOpen && (
        <div className="xl:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Tutup tanya jawab AI"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 right-0 w-[min(92vw,380px)] p-3">
            <div className="h-full flex flex-col">
              <ChatPanel {...panelProps} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="mt-2 px-4 py-2 rounded-md border bg-background text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
