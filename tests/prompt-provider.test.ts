import assert from "node:assert/strict"
import test from "node:test"
import { generateMockPrompt } from "../src/lib/ai/prompt-provider"

test("mock prompt memakai input usaha dan kebutuhan, mode demo", () => {
  const result = generateMockPrompt({
    business: "warung kopi",
    need: "caption promo",
    goal: "menaikkan repeat order",
    tone: "santai",
  })
  assert.equal(result.mode, "demo")
  assert.ok(result.prompt.includes("warung kopi"))
  assert.ok(result.prompt.includes("caption promo"))
  assert.ok(result.prompt.includes("menaikkan repeat order"))
  assert.equal(result.variations.length, 3)
  assert.ok(result.tips.length > 0)
})

test("mock prompt deterministik untuk input yang sama", () => {
  const input = { business: "toko kue", need: "deskripsi produk" }
  assert.deepEqual(generateMockPrompt(input), generateMockPrompt(input))
})

test("mock prompt tanpa goal dan tone tetap valid", () => {
  const result = generateMockPrompt({ business: "jasa laundry", need: "pesan broadcast" })
  assert.equal(result.mode, "demo")
  assert.ok(result.prompt.includes("jasa laundry"))
  assert.ok(result.prompt.includes("pesan broadcast"))
})
