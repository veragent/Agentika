"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function NewsletterForm({ title, description, className }: { title?: string; description?: string; className?: string }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, tags: ["website", "blog"] }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(data.message || "Berhasil subscribe!")
        setEmail("")
        setName("")
      } else {
        setStatus("error")
        setMessage(data.message || "Gagal subscribe, coba lagi.")
      }
    } catch {
      setStatus("error")
      setMessage("Terjadi kesalahan, coba lagi.")
    }
  }

  if (status === "success") {
    return (
      <div className={className} role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-center py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">Cek email kamu untuk konfirmasi (double opt-in).</p>
          <button
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            onClick={() => setStatus("idle")}
          >
            Subscribe email lain
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}

      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
        <div className="flex-1">
          <label htmlFor="newsletter-name" className="sr-only">Nama (opsional)</label>
          <Input
            id="newsletter-name"
            type="text"
            placeholder="Nama kamu (opsional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "loading"}
            className="mb-2"
          />
        </div>
        <div className="flex-1 relative">
          <label htmlFor="newsletter-email" className="sr-only">Alamat email</label>
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="newsletter-email"
            type="email"
            placeholder="email@kamu.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
            className="pl-10"
            autoComplete="email"
            aria-label="Alamat email untuk newsletter"
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading" || !email}
          className="shrink-0 whitespace-nowrap"
          aria-busy={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Subscribe
            </>
          )}
        </Button>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 w-full max-w-md mt-2 p-3 rounded-lg bg-destructive/10 text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{message}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3 max-w-md">
        No spam. Hanya konten AI, otomatisasi, & side hustle untuk UMKM Indonesia.{' '}
        <a href="/faq" className="underline hover:text-foreground">Kebijakan Privasi</a>
      </p>
    </form>
  )
}