import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdSlot } from "@/components/ads/ad-slot"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getLearnNavigation } from "@/lib/learn"
import { publicIcons } from "@/components/icons/public-icons"
import { NewsletterForm } from "@/components/newsletter/newsletter-form"

const { blog: BlogIcon, learn: LearnIcon } = publicIcons

export default async function HomePage() {
  const learnNavigation = await getLearnNavigation()
  const learnPages = learnNavigation.flatMap((track) =>
    track.sections.flatMap((section) =>
      section.pages.map((page) => ({ slug: page.slug, title: page.title })),
    ),
  )

  return (
    <div className="flex flex-col gap-20 py-10 md:py-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          ✦ Platform AI untuk UMKM Indonesia
        </div>
        <h1 className="text-display max-w-4xl">
          Otomatisasi Kerja & Side Hustle dengan{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="text-body-lg max-w-[720px] text-muted-foreground">
          Temukan tools AI, tutorial otomatisasi, dan strategi side hustle untuk bisnis online Indonesia.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/learn" className={buttonVariants({ size: "lg", className: "h-12 px-8 shadow-lg shadow-primary/20" })}>
            Mulai Belajar <LearnIcon className="ml-2 h-5 w-5" />
          </Link>
          <Link href="/blog" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-8" })}>
            Baca Artikel
          </Link>
        </div>
      </section>

      <AdSlot section="homepage" className="rounded-xl border p-4" />

      {/* Feature cards */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
        {[
          {
            icon: <BlogIcon className="mb-3 h-10 w-10 text-primary" />,
            title: "Artikel & Tutorial",
            description: "Panduan praktis menggunakan AI untuk bisnis, konten, dan produktivitas.",
            href: "/blog",
            label: "Baca Blog",
            delay: "animation-delay-100",
          },
          {
            icon: <LearnIcon className="mb-3 h-10 w-10 text-secondary" />,
            title: "Learning Tracks",
            description: "Kurikulum terstruktur: Prompt Engineering, AI Automation, No-Code Tools.",
            href: "/learn",
            label: "Eksplor Materi",
            delay: "animation-delay-200",
          },
        ].map((item) => (
          <Card key={item.href} className={cn("animate-fade-in-up", item.delay)}>
            <CardHeader>
              {item.icon}
              <CardTitle className="font-heading text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                {item.label} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* CTA */}
      <section className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-10 text-center ring-1 ring-primary/20 md:p-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.69_0.2_271/0.12)_0%,transparent_70%)]" />
        <h2 className="text-heading">Siap Memulai Otomatisasi dengan AI?</h2>
        <p className="max-w-2xl text-muted-foreground">
          Bergabunglah dengan ribuan UMKM dan pebisnis online yang sudah memanfaatkan AI untuk efisiensi dan pendapatan tambahan.
        </p>
        <Link href="/learn" className={buttonVariants({ size: "lg", className: "h-12 px-8 shadow-lg shadow-primary/20" })}>
          Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </section>

      {/* Newsletter */}
      <section className="container px-4 py-10">
        <NewsletterForm
          title="Dapatkan Update Terbaru"
          description="Kirimkan tips AI, otomatisasi, & side hustle langsung ke inbox kamu. Gratis, no spam."
        />
      </section>
    </div>
  )
}