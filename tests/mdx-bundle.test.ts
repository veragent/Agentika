import assert from "node:assert/strict"
import test from "node:test"
import {
  getAllFilesMetadata,
  getAllFilesMetadataFromBundle,
} from "../src/lib/mdx"
import { getPublishedBlogPosts } from "../src/lib/blog"

// Regresi: digest mingguan gagal live 10 Nov 2026 dengan "no-posts"
// karena getAllFilesMetadata hanya membaca fs — di Cloudflare Workers
// tidak ada filesystem saat request, jadi daftar posting kosong.
// Fallback bundle (CONTENT_BUNDLE) harus menyediakan metadata yang sama.
test("metadata bundle blog sama dengan metadata fs", () => {
  const fromFs = getAllFilesMetadata("blog").map((post) => post.slug)
  const fromBundle = getAllFilesMetadataFromBundle("blog").map(
    (post) => post.slug,
  )

  assert.equal(fromBundle.length, fromFs.length)
  assert.deepEqual(new Set(fromBundle), new Set(fromFs))
})

test("metadata bundle learn sama dengan metadata fs", () => {
  const fromFs = getAllFilesMetadata("learn").map((post) => post.slug)
  const fromBundle = getAllFilesMetadataFromBundle("learn").map(
    (post) => post.slug,
  )

  assert.equal(fromBundle.length, fromFs.length)
  assert.deepEqual(new Set(fromBundle), new Set(fromFs))
})

test("bundle memuat artikel #47 yang sudah terbit", () => {
  const post = getAllFilesMetadataFromBundle("blog").find(
    (item) => item.slug === "tutup-kas-harian-ai",
  )

  assert.ok(post)
  assert.equal(post?.published, true)
  assert.equal(post?.date, "2026-11-10")
})

test("getPublishedBlogPosts tidak kosong dan terurut tanggal menurun", () => {
  const posts = getPublishedBlogPosts()

  assert.ok(posts.length >= 40)
  assert.ok(
    posts.some((post) => post.slug === "tutup-kas-harian-ai"),
  )
  assert.ok(posts.every((post) => post.published !== false))

  const times = posts.map((post) =>
    post.date ? new Date(post.date).getTime() : 0,
  )
  const sorted = [...times].sort((a, b) => b - a)
  assert.deepEqual(times, sorted)
})
