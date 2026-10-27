/**
 * Shared helpers for Agentika's WebMCP surface (read-only agent tools).
 *
 * Everything here is pure and unit-tested (tests/webmcp.test.ts): slug
 * validation (prevents path traversal into content files), MDX → plain
 * text for article previews, output truncation to the ~1.5K character
 * budget Chrome recommends for tool results, and scoring for the
 * client-side search tool over public/search-index.json.
 */

/** Lowercase slugs only: letters, digits, dashes, never starting with -. */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value)
}

/** Cut text at a word boundary and mark truncation. No-op when short. */
export function truncateText(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= maxChars) return clean
  const cut = clean.slice(0, maxChars)
  const lastSpace = cut.lastIndexOf(" ")
  return `${lastSpace > maxChars * 0.5 ? cut.slice(0, lastSpace) : cut}…`
}

/**
 * Rough MDX → plain text for article previews. Drops code fences, JSX/HTML
 * tags, images, and link markup; keeps readable prose and table cells
 * (pipes become separators). Not a full Markdown renderer by design.
 */
export function mdxToPlainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>|]/g, " ")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Headings (## / ###) of an MDX document, code fences excluded. */
export function extractHeadings(mdx: string): string[] {
  const withoutCode = mdx.replace(/```[\s\S]*?```/g, "")
  return [...withoutCode.matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((match) => match[1].trim())
    .filter(Boolean)
    .slice(0, 12)
}

export interface SearchIndexEntry {
  type: string
  title: string
  excerpt: string
  url: string
  tags?: string[]
}

/**
 * Score search-index entries against a keyword query. Title matches weigh
 * most, then tags, then excerpt text. Returns at most `limit` entries with
 * a positive score, best first. Empty queries return nothing.
 */
export function scoreSearchEntries(
  entries: SearchIndexEntry[],
  query: string,
  typeFilter?: string,
  limit = 8,
): SearchIndexEntry[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length === 0) return []

  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase()
      const excerpt = (entry.excerpt ?? "").toLowerCase()
      const tags = (entry.tags ?? []).join(" ").toLowerCase()
      let score = 0
      for (const token of tokens) {
        if (title.includes(token)) score += 3
        if (tags.includes(token)) score += 2
        if (excerpt.includes(token)) score += 1
      }
      return { entry, score }
    })
    .filter(
      ({ entry, score }) =>
        score > 0 && (!typeFilter || entry.type === typeFilter),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry)
}
