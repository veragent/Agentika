import Link from "next/link"
import type { AuthorProfile } from "@/lib/authors"

export function AuthorCard({ author }: { author: AuthorProfile }) {
  return (
    <aside
      aria-label="Tentang penulis"
      className="my-8 rounded-lg border bg-muted/30 p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Ditulis oleh
      </p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
        <Link
          href="/tentang"
          className="text-base font-semibold hover:text-primary hover:underline"
        >
          {author.name}
        </Link>
        <span className="text-xs text-muted-foreground">{author.role}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {author.bio}
      </p>
      <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium">
        <Link href="/tentang" className="text-primary hover:underline">
          Metodologi Editorial →
        </Link>
        {author.sameAs.map((profileUrl) => {
          const label = profileUrl.includes("github.com")
            ? "GitHub"
            : profileUrl.includes("linkedin.com")
              ? "LinkedIn"
              : "X / Twitter"
          return (
            <a
              key={profileUrl}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary hover:underline"
            >
              {label} ↗
            </a>
          )
        })}
      </div>
    </aside>
  )
}
