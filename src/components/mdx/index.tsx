import remarkGfm from "remark-gfm"
import { Callout } from "./callout"
import { CodeBlock } from "./code-block"
import { Table } from "./table"
import { YoutubeEmbed } from "./youtube-embed"
import { Comparison } from "./comparison"

export const components = {
  Callout,
  CodeBlock,
  // Lowercase key: maps the intrinsic <table> element, not a custom tag.
  table: Table,
  YoutubeEmbed,
  Comparison,
}

// Shared MDX compile options for the blog and learn pages.
// remark-gfm enables GitHub Flavored Markdown (tables, strikethrough,
// task lists, autolinks). Without it, table syntax in .mdx sources is
// parsed as plain paragraph text and readers see raw pipes.
export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
}
