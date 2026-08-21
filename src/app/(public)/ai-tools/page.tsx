import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { aiTools, getAllCategories, getFeaturedTools } from '@/lib/ai-tools'
import { ToolsFilter } from '@/components/ai-tools/ToolsFilter'

export const metadata: Metadata = {
  title: 'AI Tools Directory',
  description: 'Daftar tools AI untuk konten, produktivitas, dan bisnis. 90+ tools dalam kategori Writing, Coding, Image, Video, Audio, dan Web3.',
  alternates: { canonical: '/ai-tools' },
}

export default function AiToolsPage() {
  const categories = getAllCategories()
  const featured = getFeaturedTools()

  return (
    <section className="container py-8">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Tools Directory</h1>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
          Kumpulan tools AI untuk konten, produktivitas, dan bisnis online. {aiTools.length} tools dalam {categories.length} kategori.
        </p>
        
        {/* Featured tools */}
        {featured.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Featured:</span>
            {featured.map((tool) => (
              <span key={tool.slug} className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full border border-primary/20">
                {tool.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="mb-6 overflow-x-auto">
        <nav className="flex gap-2 flex-nowrap pb-2" role="tablist" aria-label="Kategori tools">
          <button
            data-category="all"
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground whitespace-nowrap transition-colors"
            role="tab"
            aria-selected="true"
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category}
              data-category={category}
              className="px-4 py-2 text-sm font-medium rounded-full bg-muted text-muted-foreground whitespace-nowrap transition-colors hover:bg-muted/80"
              role="tab"
              aria-selected="false"
            >
              {category}
            </button>
          ))}
        </nav>
      </div>

      {/* Client-side filter */}
      <ToolsFilter />

      {/* Tools grid */}
      <div
        id="tools-grid"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="list"
        aria-label="Daftar AI tools"
      >
        {aiTools.map((tool) => (
          <article
            key={tool.slug}
            data-category={tool.category}
            className="group card flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            role="listitem"
          >
            <CardHeader className="flex flex-col gap-2 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg line-clamp-1">{tool.name}</CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full border
                  {tool.pricing === 'Free' ? 'border-green-300 text-green-700 bg-green-50' :
                   tool.pricing === 'Freemium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                   'border-blue-300 text-blue-700 bg-blue-50'}
                ">
                  {tool.pricing}
                </span>
              </div>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {tool.tagline}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{tool.description}</p>
              
              <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  {tool.rating}
                </span>
                <span className="px-2 py-0.5 rounded bg-muted">{tool.category}</span>
                {tool.affiliateLink && (
                  <a
                    href={tool.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Link
                  </a>
                )}
              </div>
            </CardContent>
          </article>
        ))}
      </div>

      {/* Empty state */}
      <div id="empty-state" className="hidden text-center py-12">
        <p className="text-muted-foreground">Tidak ada tools di kategori ini.</p>
      </div>
    </section>
  )
}