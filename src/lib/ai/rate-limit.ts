/**
 * Rate limiter in-memory untuk endpoint AI Chat (MVP Phase 4).
 *
 * Desain awal memakai batas per sesi; karena sesi belum tersedia, kunci
 * yang dipakai adalah alamat IP klien. Batas per jam (20) dan per hari
 * (100) mengikuti desain; batas per menit disetel 5 agar pemakaian
 * normal dari satu IP bersama tidak mudah terblokir.
 *
 * State hidup di memori proses: batas berlaku per instance server dan
 * reset saat restart. Store bersama (Redis/Upstash) diperlukan sebelum
 * mode provider dipakai di banyak instance, di luar scope MVP.
 */

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
