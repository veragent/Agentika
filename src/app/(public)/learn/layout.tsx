import Link from "next/link"
import { getLearnNavigation } from "@/lib/learn"

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structure = await getLearnNavigation()

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6 md:flex-row md:gap-8">
      <aside className="hidden md:block w-64 flex-shrink-0">
        <nav className="sticky top-24 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {structure.map((track) => (
            <section key={track.slug} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {track.title}
              </h3>
              <ul className="space-y-1">
                {track.sections.flatMap((section) =>
                  section.pages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={`/learn/${page.slug}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
      <main className="max-w-3xl flex-1">{children}</main>
    </div>
  )
}