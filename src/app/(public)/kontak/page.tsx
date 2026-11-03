import type { Metadata } from "next"
import { generateSeo } from "@/lib/seo"

export const metadata: Metadata = generateSeo({
  title: "Kontak",
  description:
    "Hubungi tim AGENTIKA untuk koreksi konten, usulan tool, atau kerja sama: email, X, dan GitHub.",
  type: "website",
  canonical: "/kontak",
})

export default function KontakPage() {
  return (
    <section className="container py-8">
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Kontak
          </h1>
          <p className="mt-4 text-muted-foreground">
            Koreksi konten, usulan tool, dan ajakan kerja sama bisa dikirim
            lewat kanal di bawah ini. Saat melaporkan koreksi, sebutkan
            halaman dan bagian yang dimaksud supaya cepat ditindaklanjuti.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Email</h2>
          <p className="text-muted-foreground">
            <a
              href="mailto:halo@agentika.web.id"
              className="text-primary hover:underline"
            >
              halo@agentika.web.id
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Media sosial dan kode</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <a
                href="https://x.com/Agentika_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Twitter / X: @Agentika_ai
              </a>
            </li>
            <li>
              <a
                href="https://github.com/veragent/Agentika"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub: veragent/Agentika
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
