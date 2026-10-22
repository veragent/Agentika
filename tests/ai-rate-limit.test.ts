import assert from "node:assert/strict"
import test from "node:test"
import { checkAiChatRateLimit } from "../src/lib/ai/rate-limit"

const T0 = 1_700_000_000_000

test("memblokir permintaan ke-6 dalam satu menit", () => {
  const key = "ip-minute"
  for (let i = 0; i < 5; i++) {
    assert.equal(checkAiChatRateLimit(key, T0 + i * 1000).allowed, true)
  }
  const sixth = checkAiChatRateLimit(key, T0 + 5000)
  assert.equal(sixth.allowed, false)
  assert.ok(sixth.retryAfterSeconds > 0)
  assert.equal(checkAiChatRateLimit(key, T0 + 61_000).allowed, true)
})

test("memblokir permintaan ke-21 dalam satu jam", () => {
  const key = "ip-hour"
  for (let i = 0; i < 20; i++) {
    assert.equal(checkAiChatRateLimit(key, T0 + i * 61_000).allowed, true)
  }
  assert.equal(checkAiChatRateLimit(key, T0 + 20 * 61_000).allowed, false)
})

test("memblokir permintaan ke-101 dalam satu hari", () => {
  const key = "ip-day"
  // Jeda 12 menit: jendela menit dan jam tidak pernah penuh.
  for (let i = 0; i < 100; i++) {
    assert.equal(
      checkAiChatRateLimit(key, T0 + i * 12 * 60_000).allowed,
      true,
    )
  }
  assert.equal(
    checkAiChatRateLimit(key, T0 + 100 * 12 * 60_000).allowed,
    false,
  )
})

test("kunci berbeda memiliki kuota sendiri", () => {
  const keyA = "ip-a"
  const keyB = "ip-b"
  for (let i = 0; i < 5; i++) {
    checkAiChatRateLimit(keyA, T0 + i * 1000)
  }
  assert.equal(checkAiChatRateLimit(keyA, T0 + 5000).allowed, false)
  assert.equal(checkAiChatRateLimit(keyB, T0 + 5000).allowed, true)
})
