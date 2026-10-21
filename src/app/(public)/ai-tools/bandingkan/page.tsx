import type { Metadata } from "next"
import Link from "next/link"
import {
  aiTools,
  getToolBySlug,
  MAX_COMPARE_TOOLS,
  type AITool,
} from "@/lib/ai-tools"
import { ComparePicker } from "@/components/ai-tools/ComparePicker"

export const metadata: Metadata = {
  title: "Bandingkan AI Tools",
  description:
    "Bandingkan sampai 3 AI tools side-by-side: rating, harga, fitur utama, kelebihan, dan kekurangan. Bagikan link perbandingannya ke tim atau partner usaha.",
  alternates: { canonical: "/ai-tools/bandingkan" },
}

function parseSelectedTools(raw: string | string[] | undefined): AITool[] {
  const value = Array.isArray(raw) ? raw.join(",") : (raw ?? "")
  const slugs = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const unique = [...new Set(slugs)].slice(0, MAX_COMPARE_TOOLS)
  return unique
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is AITool => Boolean(t))
}

function ListCell({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground italic">Belum ada data</span>
  }
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

const ROWS: Array<{
  label: string
  render: (tool: AITool) => React.ReactNode
}> = [
  {
    label: "Rating",
    render: (tool) => (
      <span className="flex items-center gap-1">
        <span className="text-yellow-500">★</span> {tool.rating} / 5
      </span>
    ),
  },
  {
    label: "Kategori",
    render: (tool) => tool.category,
  },
  {
    label: "Model harga",
    render: (tool) => tool.pricing,
  },
  {
    label: "Cocok untuk",
    render: (tool) => tool.tagline,
  },
  {
    label: "Deskripsi",
    render: (tool) => tool.description,
  },
  {
    label: "Fitur utama",
    render: (tool) => <ListCell items={tool.features} />,
  },
  {
    label: "Kelebihan",
    render: (tool) => <ListCell items={tool.pros} />,
  },
  {
    label: "Kekurangan",
    render: (tool) => <ListCell items={tool.cons} />,
  },
]

export default async function CompareToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tools?: string | string[] }>
}) {
  const { tools: rawTools } = await searchParams
  const selected = parseSelectedTools(rawTools)
  const options = [...aiTools]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({ slug: t.slug, name: t.name, category: t.category }))

  return (
    <section className="container py-8">
      <Link
        href="/ai-tools"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Semua tools
      </Link>

      <div className="space-y-3 mt-6 mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bandingkan AI Tools
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
          Pilih sampai {MAX_COMPARE_TOOLS} tool untuk dibandingkan side-by-side.
          Link halaman ini berubah mengikuti pilihanmu, jadi bisa dibagikan
          apa adanya.
        </p>
      </div>

      <div className="mb-8">
        <ComparePicker
          tools={options}
          selected={selected.map((t) => t.slug)}
        />
      </div>

      {selected.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center space-y-3">
          <p className="text-muted-foreground">
            Belum ada tool yang dibandingkan. Mulai dari pasangan yang paling
            sering ditanyakan:
          </p>
          <Link
            href="/ai-tools/bandingkan?tools=chatgpt,claude"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            ChatGPT vs Claude →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium p-4 w-32 align-top">
                  Aspek
                </th>
                {selected.map((tool) => (
                  <th
                    key={tool.slug}
                    className="text-left font-semibold p-4 align-top min-w-56"
                  >
                    <Link
                      href={`/ai-tools/${tool.slug}`}
                      className="hover:text-primary"
                    >
                      {tool.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <th className="text-left font-medium p-4 align-top text-muted-foreground">
                    {row.label}
                  </th>
                  {selected.map((tool) => (
                    <td key={tool.slug} className="p-4 align-top">
                      {row.render(tool)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="text-left font-medium p-4 align-top text-muted-foreground">
                  Tautan
                </th>
                {selected.map((tool) => (
                  <td key={tool.slug} className="p-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/ai-tools/${tool.slug}`}
                        className="px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-muted"
                      >
                        Lihat detail
                      </Link>
                      {tool.affiliateLink && (
                        <a
                          href={tool.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                        >
                          Kunjungi ↗
                        </a>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {selected.length === 1 && (
        <p className="text-sm text-muted-foreground mt-4">
          Tambahkan satu atau dua tool lagi lewat pemilih di atas untuk
          melihat perbandingannya.
        </p>
      )}
    </section>
  )
}
