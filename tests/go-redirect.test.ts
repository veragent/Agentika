import test from "node:test"
import assert from "node:assert/strict"
import { GET } from "../src/app/go/[slug]/route"

test("GET /go/chatgpt mengembalikan 302 ke tujuan tool", async () => {
  const res = await GET(new Request("http://localhost/go/chatgpt"), {
    params: Promise.resolve({ slug: "chatgpt" }),
  })
  assert.equal(res.status, 302)
  assert.equal(res.headers.get("location"), "https://openai.com/chatgpt")
})

test("GET /go/<slug-tak-dikenal> mengembalikan 404", async () => {
  const res = await GET(new Request("http://localhost/go/tidak-ada"), {
    params: Promise.resolve({ slug: "tidak-ada" }),
  })
  assert.equal(res.status, 404)
})

test("GET /go/<tool-tanpa-affiliateLink> mengembalikan 404", async () => {
  // jasper terisi penuh tapi tidak punya affiliateLink di data.
  const res = await GET(new Request("http://localhost/go/jasper"), {
    params: Promise.resolve({ slug: "jasper" }),
  })
  assert.equal(res.status, 404)
})
