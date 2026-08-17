import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublishedBlogPosts, slugifyHeading } from "@/lib/blog"
import type { Metadata } from "next"
import Link from "next/link"
import { NewsletterForm } from "@/components/newsletter/newsletter-form"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Blog",
  description: "Artikel terbaru seputar AI, otomatisasi, dan side hustle untuk UMKM Indonesia.",
  alternates: { canonical: "/blog" },
}

export default async function BlogPage() {
  const posts = getPublishedBlogPosts()

  // Extract unique categories and tags
  const categories = Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c))))
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags ?? [])))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-lg text-muted-foreground">Artikel terbaru seputar AI, otomatisasi, dan side hustle untuk UMKM Indonesia.</p>
      </div>

      <AdSlot section="blog_list" className="rounded-xl border p-4" />

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link key={category} href={`/blog/category/${slugifyHeading(category)}`}>
              <Badge variant="outline">{category}</Badge>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog/tag/${slugifyHeading(tag)}`}>
              <Badge variant="secondary">#{tag}</Badge>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <div className="mb-2 text-xs font-medium text-primary">{post.category}</div>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{(post.date ?? "").split("T")[0]}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <InternalLinksBlock />

      {/* Newsletter */}
      <section className="container px-4 py-10">
        <NewsletterForm
          title="Jangan Lewatkan Artikel Terbaru"
          description="Dapatkan kurasi artikel AI, otomatisasi, & side hustle mingguan langsung ke inbox."
        />
      </section>
    </div>
  )
}