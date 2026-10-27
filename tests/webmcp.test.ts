import assert from "node:assert/strict"
import test from "node:test"
import {
  extractHeadings,
  isValidSlug,
  mdxToPlainText,
  scoreSearchEntries,
  truncateText,
  type SearchIndexEntry,
} from "../src/lib/webmcp"

test("isValidSlug menerima slug huruf kecil dan menolak traversal", () => {
  assert.equal(isValidSlug("chatgpt"), true)
  assert.equal(isValidSlug("studi-kasus-laundry-ai"), true)
  assert.equal(isValidSlug("ABC"), false)
  assert.equal(isValidSlug(""), false)
  assert.equal(isValidSlug("-depan"), false)
  assert.equal(isValidSlug("../x"), false)
  assert.equal(isValidSlug("a b"), false)
  assert.equal(isValidSlug("a/b"), false)
})

test("truncateText tidak memotong teks pendek dan memotong di batas kata", () => {
  assert.equal(truncateText("halo dunia", 20), "halo dunia")
  const cut = truncateText("satu dua tiga empat lima", 12)
  assert.ok(cut.endsWith("…"))
  assert.ok(!cut.includes("tiga"))
  assert.ok(cut.startsWith("satu dua"))
})

test("mdxToPlainText menghapus markup tapi mempertahankan teks", () => {
  const mdx = [
    "## Judul Bagian",
    "Ini **tebal** dan [tautan](https://example.com) plus ![alt](img.png).",
    "```ts",
    "const x = 1",
    "```",
    "<Callout>isi callout</Callout>",
    "| Kolom A | Kolom B |",
  ].join("\n")
  const plain = mdxToPlainText(mdx)
  assert.ok(plain.includes("Judul Bagian"))
  assert.ok(plain.includes("tebal"))
  assert.ok(plain.includes("tautan"))
  assert.ok(!plain.includes("https://example.com"))
  assert.ok(!plain.includes("const x"))
  assert.ok(!plain.includes("<Callout>"))
  assert.ok(plain.includes("Kolom A"))
})

test("extractHeadings hanya mengambil ## dan ### di luar code fence", () => {
  const mdx = [
    "# Judul Utama",
    "## Bagian Satu",
    "```md",
    "## Bukan Heading",
    "```",
    "### Sub Bagian",
  ].join("\n")
  assert.deepEqual(extractHeadings(mdx), ["Bagian Satu", "Sub Bagian"])
})

test("scoreSearchEntries mengutamakan judul, memfilter tipe, dan kosong untuk query kosong", () => {
  const entries: SearchIndexEntry[] = [
    { type: "blog", title: "Laundry AI", excerpt: "tentang kopi", url: "/blog/a" },
    { type: "tool", title: "Kopi Tools", excerpt: "tentang laundry", url: "/ai-tools/b" },
    { type: "learn", title: "Lain", excerpt: "tidak nyambung", url: "/learn/c" },
  ]
  const hits = scoreSearchEntries(entries, "laundry")
  assert.equal(hits[0].url, "/blog/a")
  assert.equal(hits.length, 2)
  assert.deepEqual(scoreSearchEntries(entries, "laundry", "tool"), [
    entries[1],
  ])
  assert.deepEqual(scoreSearchEntries(entries, "   "), [])
})
