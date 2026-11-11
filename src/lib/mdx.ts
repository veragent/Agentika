import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { CONTENT_BUNDLE, LEARN_STRUCTURE } from "./content-bundle.generated"

const CONTENT_PATH = path.join(process.cwd(), "content")

/**
 * Recursively find a file by its basename under `dir`.
 * Used so blog posts can be organized in category subdirectories
 * on disk while keeping flat public URLs (/blog/<slug>).
 */
function findFileByBasename(dir: string, fileName: string): string | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const nested = findFileByBasename(fullPath, fileName)
      if (nested) return nested
    } else if (entry.name === fileName) {
      return fullPath
    }
  }
  return null
}

export type ContentType = "blog" | "learn" | "airdrop"

export interface PostMetadata {
  title: string
  date?: string
  author?: string
  authors?: string[]
  category?: string
  tags?: string[]
  excerpt?: string
  description?: string
  coverImage?: string
  published?: boolean
  featured?: boolean
  slug: string
  order?: number
}

interface LearnPage {
  title: string
  slug: string
  order: number
}

interface LearnTrack {
  title: string
  slug: string
  pages: LearnPage[]
}

/**
 * Normalisasi metadata: frontmatter artikel memakai `description:` (35 dari
 * 52 artikel blog) atau `excerpt:` (17). Semua konsumen — metadata SEO,
 * kartu terkait, daftar blog — membaca `excerpt`, jadi `description`
 * dijadikan fallback di sumber agar tidak ada artikel yang kehilangan
 * deskripsi (temuan CWV 11 Nov 2026: artikel #47 tanpa meta description).
 */
function normalizeMetadata(data: Record<string, unknown>, slug: string): PostMetadata {
  const meta = data as unknown as PostMetadata
  return {
    ...meta,
    slug,
    excerpt: meta.excerpt ?? meta.description,
  }
}

export function getFileBySlug(type: ContentType, slug: string) {
  // Bundled copy first: the only path that works in Cloudflare Workers,
  // where there is no filesystem at request time.
  const bundled = CONTENT_BUNDLE[`${type}/${slug}`]
  if (bundled) {
    return {
      content: bundled.content,
      frontMatter: normalizeMetadata(bundled.frontMatter as Record<string, unknown>, slug),
    }
  }

  // Filesystem fallback (local dev / Vercel). Guarded: in Workers fs calls
  // throw, and a missing file must be a 404, not a 500.
  try {
    let filePath = path.join(CONTENT_PATH, type, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) {
      // Fallback: blog posts may live in category subdirectories on disk.
      // Resolve by basename so public URLs stay flat (/blog/<slug>).
      const found = findFileByBasename(path.join(CONTENT_PATH, type), `${slug}.mdx`)
      if (!found) return null
      filePath = found
    }

    const source = fs.readFileSync(filePath, "utf8")
    const { data, content } = matter(source)

    return {
      content,
      frontMatter: normalizeMetadata(data as Record<string, unknown>, slug),
    }
  } catch {
    return null
  }
}

/**
 * Metadata dari CONTENT_BUNDLE (dibangkitkan saat build). Satu-satunya
 * sumber yang bekerja di Cloudflare Workers, di mana tidak ada filesystem
 * saat request. Dipakai sebagai fallback saat direktori konten tidak
 * terbaca lewat fs, dan bisa dites langsung tanpa mocking fs.
 */
export function getAllFilesMetadataFromBundle(type: ContentType): PostMetadata[] {
  const prefix = `${type}/`

  return Object.entries(CONTENT_BUNDLE)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, entry]) => {
      const relativePath = key.slice(prefix.length)
      // Blog URLs stay flat (/blog/<slug>); learn/airdrop keep full paths.
      const slug =
        type === "blog"
          ? (relativePath.split("/").pop() ?? relativePath)
          : relativePath

      return normalizeMetadata(entry.frontMatter as Record<string, unknown>, slug)
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function getAllFilesMetadata(type: ContentType): PostMetadata[] {
  const dirPath = path.join(CONTENT_PATH, type)
  try {
    if (!fs.existsSync(dirPath)) return getAllFilesMetadataFromBundle(type)

    const files = fs.readdirSync(dirPath, { recursive: true }) as string[]

    return files
      .reduce((allPosts: PostMetadata[], file: string) => {
        if (!file.endsWith(".mdx")) return allPosts

        const relativePath = file.replace(/\\/g, "/")
        const source = fs.readFileSync(path.join(dirPath, file), "utf8")
        const { data } = matter(source)

        // Blog URLs stay flat (/blog/<slug>); the category subdirectory
        // on disk is only for organization. Learn/airdrop keep full paths.
        const slug =
          type === "blog"
            ? (relativePath.split("/").pop() ?? relativePath).replace(/\.mdx$/, "")
            : relativePath.replace(/\.mdx$/, "")

        return [normalizeMetadata(data as Record<string, unknown>, slug), ...allPosts]
      }, [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch {
    // fs tidak tersedia (Cloudflare Workers): pakai bundle.
    return getAllFilesMetadataFromBundle(type)
  }
}

export function getLearnStructure(): LearnTrack[] {
  // Bundled copy first: the only path that works in Cloudflare Workers.
  if (LEARN_STRUCTURE.length > 0) return LEARN_STRUCTURE

  try {
    return getLearnStructureFromFs()
  } catch {
    return []
  }
}

function getLearnStructureFromFs(): LearnTrack[] {
  const learnPath = path.join(CONTENT_PATH, "learn")
  if (!fs.existsSync(learnPath)) return []

  const tracks = fs.readdirSync(learnPath)

  return tracks.flatMap((trackSlug) => {
    const trackPath = path.join(learnPath, trackSlug)
    if (!fs.statSync(trackPath).isDirectory()) return []

    const pages = fs
      .readdirSync(trackPath)
      .filter((file) => file.endsWith(".mdx"))
      .map((file): LearnPage => {
        const source = fs.readFileSync(path.join(trackPath, file), "utf8")
        const { data } = matter(source)

        return {
          title: String(data.title ?? file),
          slug: `learn/${trackSlug}/${file.replace(".mdx", "")}`,
          order: typeof data.order === "number" ? data.order : 0,
        }
      })
      .sort((a, b) => a.order - b.order)

    return [
      {
        title: trackSlug
          .split("-")
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(" "),
        slug: trackSlug,
        pages,
      },
    ]
  })
}
