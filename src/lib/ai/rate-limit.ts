/**
 * Rate limiter endpoint AI.
 *
 * Kunci yang dipakai adalah alamat IP klien (sesi belum tersedia).
 * Batas: 5/menit, 20/jam, 100/hari per IP. Batas per menit disetel 5
 * agar pemakaian normal dari satu IP bersama tidak mudah terblokir.
 *
 * Dua jalur:
 * - `checkAiRateLimit` (async, dipakai semua route AI): bila Upstash
 *   Redis terkonfigurasi, batas ditegakkan di Redis dengan sliding
 *   window sehingga berlaku lintas instance serverless; bila Redis
 *   tidak tersedia atau error, jatuh ke limiter in-memory di bawah
 *   (per instance, sama seperti perilaku lama).
 * - `checkAiChatRateLimit` (sync, in-memory): dipertahankan untuk tes
 *   dan sebagai fallback. Jangan hapus tanpa memperbarui tes.
 */

import { Ratelimit } from "@upstash/ratelimit"
import { getRedisClient } from "@/lib/cache/redis"

const PER_MINUTE = 5
const PER_HOUR = 20
const PER_DAY = 100

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const MAX_KEYS = 10_000

const hitsByKey = new Map<string, number[]>()

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

function blocked(
  oldestHit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  return {
    allowed: false,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((oldestHit + windowMs - now) / 1000),
    ),
  }
}

export function checkAiChatRateLimit(
  key: string,
  now: number = Date.now(),
): RateLimitResult {
  const recent = (hitsByKey.get(key) ?? []).filter((t) => t > now - DAY_MS)

  const lastMinute = recent.filter((t) => t > now - MINUTE_MS)
  if (lastMinute.length >= PER_MINUTE) {
    hitsByKey.set(key, recent)
    return blocked(lastMinute[0], MINUTE_MS, now)
  }

  const lastHour = recent.filter((t) => t > now - HOUR_MS)
  if (lastHour.length >= PER_HOUR) {
    hitsByKey.set(key, recent)
    return blocked(lastHour[0], HOUR_MS, now)
  }

  if (recent.length >= PER_DAY) {
    hitsByKey.set(key, recent)
    return blocked(recent[0], DAY_MS, now)
  }

  recent.push(now)
  hitsByKey.set(key, recent)

  if (hitsByKey.size > MAX_KEYS) {
    for (const [otherKey, times] of hitsByKey) {
      if (times.every((t) => t <= now - DAY_MS)) hitsByKey.delete(otherKey)
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

let upstashLimiters: {
  minute: Ratelimit
  hour: Ratelimit
  day: Ratelimit
} | null = null

function getUpstashLimiters(): typeof upstashLimiters {
  const redis = getRedisClient()
  if (!redis) return null
  if (!upstashLimiters) {
    upstashLimiters = {
      minute: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(PER_MINUTE, "1 m"),
        prefix: "ratelimit:ai:minute",
      }),
      hour: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(PER_HOUR, "1 h"),
        prefix: "ratelimit:ai:hour",
      }),
      day: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(PER_DAY, "1 d"),
        prefix: "ratelimit:ai:day",
      }),
    }
  }
  return upstashLimiters
}

/**
 * Jalur utama untuk route AI: Upstash bila tersedia, in-memory bila tidak.
 * Setiap jendela punya bucket-nya sendiri, jadi satu request menambah
 * satu hit di tiap bucket. Bila satu jendela menolak, request ditolak
 * meski bucket jendela lain sudah terlanjur bertambah — itu dapat
 * diterima karena tiap bucket menghitung request yang sama satu kali.
 */
export async function checkAiRateLimit(key: string): Promise<RateLimitResult> {
  const limiters = getUpstashLimiters()
  if (!limiters) return checkAiChatRateLimit(key)
  try {
    for (const limiter of [limiters.minute, limiters.hour, limiters.day]) {
      const result = await limiter.limit(key)
      if (!result.success) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((result.reset - Date.now()) / 1000),
          ),
        }
      }
    }
    return { allowed: true, retryAfterSeconds: 0 }
  } catch {
    return checkAiChatRateLimit(key)
  }
}
