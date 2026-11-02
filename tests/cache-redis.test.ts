import assert from "node:assert/strict"
import test from "node:test"
import {
  cacheDel,
  cacheGet,
  cacheSet,
  hashKey,
  isRedisConfigured,
} from "../src/lib/cache/redis"

// Tes ini berjalan tanpa env Upstash, jadi yang diuji adalah jalur
// fallback in-memory. Bila env Upstash ter-set di mesin tes, operasi
// tetap kembali ke memori saat Redis error (fail-open), sehingga
// perilaku yang diamati sama.

test("hashKey deterministik untuk input yang sama", () => {
  assert.equal(
    hashKey("ai:writer", ["MiniMax-M3.1-Flash", "topik A"]),
    hashKey("ai:writer", ["MiniMax-M3.1-Flash", "topik A"]),
  )
  assert.notEqual(
    hashKey("ai:writer", ["MiniMax-M3.1-Flash", "topik A"]),
    hashKey("ai:writer", ["MiniMax-M3.1-Flash", "topik B"]),
  )
})

test("cache set/get/del lewat fallback in-memory", async () => {
  const key = "test:roundtrip"
  await cacheDel(key)
  assert.equal(await cacheGet<string>(key), null)
  await cacheSet(key, "hello", 60)
  assert.equal(await cacheGet<string>(key), "hello")
  await cacheDel(key)
  assert.equal(await cacheGet<string>(key), null)
})

test("cache menghormati TTL", async () => {
  const key = "test:ttl"
  await cacheSet(key, 42, 1)
  assert.equal(await cacheGet<number>(key), 42)
  await new Promise((resolve) => setTimeout(resolve, 1100))
  assert.equal(await cacheGet<number>(key), null)
})

test("isRedisConfigured false tanpa env Upstash", () => {
  if (
    !process.env.UPSTASH_REDIS_REST_URL &&
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    assert.equal(isRedisConfigured(), false)
  }
})
