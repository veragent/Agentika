/**
 * Build-time generator untuk search index gabungan (Phase 5).
 *
 * Menghasilkan public/search-index.json dari blog + learn + tools.
 * Dijalankan otomatis lewat script "prebuild" sebelum `npm run build`,
 * atau manual: `npm run search-index`.
 *
 * Riset: ~/workspace/agentika/fusejs-research-2026-10-19.md
 * Catatan: file hasil adalah artefak build (di-.gitignore), bukan sumber.
 */
import fs from "node:fs"
import path from "node:path"
import { getPublishedBlogPosts } from "../src/lib/blog"
import { getAllFilesMetadata } from "../src/lib/mdx"
import { aiTools } from "../src/lib/ai-tools"

export interface SearchIndexItem {
  type: "blog" | "learn" | "tool"
  title: string
  excerpt: string
  url: string
  category?: string
  tags?: string[]
}

const items: SearchIndexItem[] = []

for (const post of getPublishedBlogPosts()) {
  // Frontmatter blog tidak seragam: sebagian file memakai `description:`
  // alih-alih `excerpt:` (tidak ada di tipe PostMetadata, tapi ada di data).
  const p = post as typeof post & { description?: string }
  items.push({
    type: "blog",
    title: post.title,
    excerpt: post.excerpt ?? p.description ?? "",
    url: `/blog/${post.slug}`,
    category: post.category,
    tags: post.tags,
  })
}

for (const page of getAllFilesMetadata("learn")) {
  items.push({
    type: "learn",
    title: page.title,
    excerpt: page.excerpt ?? "",
    url: `/learn/${page.slug}`,
    category: page.slug.split("/")[0],
  })
}

for (const tool of aiTools) {
  items.push({
    type: "tool",
    title: tool.name,
    excerpt: `${tool.tagline} ${tool.description}`,
    url: `/ai-tools/${tool.slug}`,
    category: tool.category,
  })
}

const outPath = path.join(process.cwd(), "public", "search-index.json")
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(items))

const count = (type: SearchIndexItem["type"]) =>
  items.filter((item) => item.type === type).length
console.log(
  `search-index.json: ${items.length} item ` +
    `(${count("blog")} blog, ${count("learn")} learn, ${count("tool")} tool) ` +
    `-> ${path.relative(process.cwd(), outPath)}`,
)
