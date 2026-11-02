import { createHash } from "node:crypto"
import { Redis } from "@upstash/redis"

/**
 * Store bersama (Upstash Redis) dengan fallback in-memory.
 *
 * Dipakai untuk dua hal yang tidak bisa mengandalkan memori proses di
 * Vercel serverless (tiap instance punya memorinya sendiri):
 * 1. Rate limiting endpoint AI (lihat src/lib/ai/rate-limit.ts).
 * 2. Caching respons AI (chat + writer) agar prompt yang sama tidak
 *    di-generate ulang dan tidak ditagih dua kali.
 *
 * Perilaku saat Upstash belum dikonfigurasi (UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN kosong) atau saat Redis error: semua operasi
 * jatuh ke store in-memory proses lokal. Itu berarti rate limit dan
 * cache tetap jalan, tapi hanya per instance — sama seperti perilaku
 * lama sebelum store bersama ada. Kegagalan Redis TIDAK PERNAH membuat
 * request gagal (fail-open untuk cache; rate limit tetap ditegakkan
 * per instance oleh fallback).
 *
 * Tidak ada secret yang di-hardcode di sini; kredensial hanya lewat env.
 */

const MAX_MEMORY_ENTRIES = 1000

interface MemoryEntry {
  value: unknown
  expiresAt: number
}

const memoryStore = new Map<string, MemoryEntry>()

function pruneMemory(now: number): void {
  for (const [key, entry] of memoryStore) {
    if (entry.expiresAt <= now) memoryStore.delete(key)
  }
  while (memoryStore.size > MAX_MEMORY_ENTRIES) {
    const oldest = memoryStore.keys().next()
    if (oldest.done) break
    memoryStore.delete(oldest.value)
  }
}

function memoryGet<T>(key: string): T | null {
  const entry = memoryStore.get(key)
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(key)
    return null
  }
  return entry.value as T
}

function memorySet(key: string, value: unknown, ttlSeconds: number): void {
  pruneMemory(Date.now())
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

function memoryDel(key: string): void {
  memoryStore.delete(key)
}

let redisClient: Redis | null | undefined

/** True bila env Upstash lengkap, tanpa peduli apakah Redis bisa dihubungi. */
export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}

/** Klien Upstash, atau null bila env belum di-set. Dibuat sekali (lazy). */
export function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient
  if (!isRedisConfigured()) {
    redisClient = null
    return redisClient
  }
  redisClient = Redis.fromEnv()
  return redisClient
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient()
  if (redis) {
    try {
      return await redis.get<T>(key)
    } catch {
      // Jatuh ke memori di bawah, jangan gagalkan request.
    }
  }
  return memoryGet<T>(key)
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 3600,
): Promise<void> {
  const redis = getRedisClient()
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds })
      return
    } catch {
      // Jatuh ke memori di bawah.
    }
  }
  memorySet(key, value, ttlSeconds)
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedisClient()
  if (redis) {
    try {
      await redis.del(key)
    } catch {
      // Lanjut hapus dari memori juga.
    }
  }
  memoryDel(key)
}

/** Kunci cache deterministik dari potongan-potongan string (model, prompt, ...). */
export function hashKey(prefix: string, parts: string[]): string {
  const hash = createHash("sha256")
  for (const part of parts) {
    hash.update(part)
    hash.update("\0")
  }
  return `${prefix}:${hash.digest("hex")}`
}
