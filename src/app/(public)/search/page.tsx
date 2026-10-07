import Link from "next/link"
import { Search as SearchIcon, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getPublishedBlogPosts } from "@/lib/blog"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
  description: "Cari artikel berdasarkan kata kunci atau hashtag.",
  alternates: { canonical: "/search" },
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

function normalizeTag(tag: string) {
  return tag.toLowerCase().replace(/^#/, "").trim()
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = (q ?? "").trim()
  const posts = getPublishedBlogPosts()

  // Hitung jumlah artikel per hashtag
  const tagCounts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const allTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])

  type Mode = "hashtag" | "text" | "none"
  let mode: Mode = "none"
  let activeTag = ""
  let results: typeof posts = []

  if (query) {
    if (query.startsWith("#")) {
      mode = "hashtag"
      activeTag = normalizeTag(query)
      results = posts.filter((post) =>
        (post.tags ?? []).some((tag) => normalizeTag(tag) === activeTag),
      )
    } else {
      mode = "text"
      const lower = query.toLowerCase()
      results = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(lower) ||
          (post.excerpt ?? "").toLowerCase().includes(lower) ||
          (post.tags ?? []).some((tag) => tag.toLowerCase().includes(lower)),
      )
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Search</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Cari artikel berdasarkan kata kunci, atau gunakan{" "}
          <span className="font-semibold text-foreground">#hashtag</span> (mis.{" "}
          <Link href="/search?q=%23umkm" className="text-primary hover:underline">
            #umkm
          </Link>
          ).
        </p>
      </div>

      <form action="/search" className="relative max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={query}
          placeholder="Ketik kata kunci atau #hashtag..."
          className="h-12 pl-10 pr-24 text-base"
        />
        <Button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2">
          Cari
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Hash className="h-5 w-5 text-primary" />
          Jelajahi hashtag
        </h2>
        <div className="flex flex-wrap gap-2">
          {allTags.map(([tag, count]) => (
            <Link key={tag} href={`/search?q=%23${encodeURIComponent(tag)}`}>
              <Badge
                variant={mode === "hashtag" && normalizeTag(tag) === activeTag ? "default" : "secondary"}
                className="cursor-pointer px-3 py-1.5 text-sm"
              >
                #{tag} <span className="ml-1 opacity-70">({count})</span>
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {mode !== "none" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {results.length > 0 ? (
              <>
                {results.length} hasil untuk{" "}
                <span className="text-primary">
                  {mode === "hashtag" ? `#${activeTag}` : `"${query}"`}
                </span>
              </>
            ) : (
              <>
                Tidak ada hasil untuk{" "}
                <span className="text-primary">
                  {mode === "hashtag" ? `#${activeTag}` : `"${query}"`}
                </span>
              </>
            )}
          </h2>

          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription>{(post.date ?? "").split("T")[0]}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                      {(post.tags ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(post.tags ?? []).slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              <p>Coba kata kunci lain, atau jelajahi hashtag di atas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
