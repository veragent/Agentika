# Setup Guide — AGENTIKA

> Panduan setup environment, dependencies, dan semua layanan yang dipakai
> project ini. **Terakhir diperbarui: 9 Nov 2026** (pasca-migrasi produksi
> ke Cloudflare Workers).
>
> Yang sudah TIDAK dipakai dan jangan di-setup lagi: database PostgreSQL /
> Neon, Prisma, NextAuth, admin panel, Inngest, Sentry. Konten disimpan
> sebagai file MDX di `content/`, tanpa database dan tanpa login.

---

## Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Model Konten](#model-konten)
4. [AI Provider](#ai-provider)
5. [Caching — Upstash Redis](#caching--upstash-redis)
6. [Email — Resend](#email--resend)
7. [Analytics](#analytics)
8. [Monetisasi — Google AdSense](#monetisasi--google-adsense)
9. [Infrastruktur Cloudflare](#infrastruktur-cloudflare)
10. [Deploy](#deploy)
11. [Environment Variables Checklist](#environment-variables-checklist)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Versi minimum |
|------|--------------|
| Node.js | v20+ |
| npm | v10+ |
| Git | latest |
| Wrangler CLI | v4+ (`npm i -g wrangler`) — untuk deploy ke Cloudflare |

Akun yang dibutuhkan: Cloudflare (Free plan), Upstash, Resend, Hcnsec
(atau provider AI lain yang kompatibel OpenAI).

---

## Quick Start

```bash
# 1. Clone repo
git clone https://github.com/veragent/Agentika.git
cd Agentika

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local
# Isi AI_API_KEY (lihat bagian AI Provider) — tanpa ini AI Chat/Writer
# jalan dalam mode mock/demo.

# 4. Jalankan development server
npm run dev
# → Buka http://localhost:3000
```

Gate sebelum commit/push:

```bash
npm run typecheck   # tsc --noEmit
npm run test        # 23 unit test
npm run lint        # eslint
npm run build       # next build (menjalankan prebuild: search index + content bundle)
```

---

## Model Konten

- Semua konten adalah **file MDX** di `content/` (blog, learn, tools, FAQ,
  glossary). Tidak ada database, tidak ada CMS, tidak ada admin panel.
- Menambah artikel/tool = menambah/mengedit file MDX, lalu commit + deploy.
- Build membangkitkan `src/lib/content-bundle.generated.ts` dari MDX
  (`scripts/generate-content-bundle.mjs`).

---

## AI Provider

> **Minimal satu wajib** untuk AI Chat (Learn) dan AI Writer. Tanpa key,
> keduanya jalan dalam mode mock/demo.

Provider dipakai lewat interface generik yang kompatibel OpenAI — ganti
provider cukup ganti 3 nilai ini, tanpa ubah kode:

```env
AI_BASE_URL="https://api.hcnsec.cn/v1"
AI_API_KEY="isi-key-di-sini"
AI_MODEL="MiniMax-M3.1-Flash"
```

Default saat ini: **Hcnsec + MiniMax-M3.1-Flash** (gratis di bawah tier 200K
per panggilan, limit ~950 req/menit di akun Hcnsec).

**Produksi (Cloudflare Workers)** memakai Workers AI, bukan Hcnsec:
model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, endpoint Workers AI akun
Cloudflare, dan `AI_API_KEY` berupa token khusus Workers AI Write. Key
produksi diisi lewat dashboard Cloudflare (`wrangler secret put`), bukan
dari `.env` — lihat [Deploy](#deploy).

---

## Caching — Upstash Redis

> **Direkomendasikan untuk production.** Satu-satunya shared store:
> rate limiting AI (5/menit, 20/jam, 100/hari per IP) + cache respons AI
> 1 jam.

1. Daftar di **https://upstash.com** (free tier tersedia)
2. **Redis** → **Create Database** — Region `ap-southeast-1` (Singapore)
3. Tab **REST API** → salin URL + token:

```env
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx"
```

> **Tanpa Upstash:** caching otomatis fallback ke in-memory (tidak persisten
> antar instance, cocok untuk development).

---

## Email — Resend

> Untuk newsletter (subscribe, welcome email, digest mingguan).

1. Daftar di **https://resend.com** (free tier: 3.000 email/bulan)
2. **API Keys** → **Create API Key** (nama: `AGENTIKA`)
3. **Add Domain** → `agentika.web.id`, ikuti petunjuk DNS (SPF, DKIM) di
   Cloudflare, lalu verifikasi domain

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEWSLETTER_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEWSLETTER_LIST_ID="c63c6498-d392-4978-8c5d-9e71b23fc41f"
NEWSLETTER_FROM_EMAIL="Agentika <halo@agentika.web.id>"
```

From address default `halo@agentika.web.id` — domain harus sudah
terverifikasi di Resend sebelum mengirim email.

---

## Analytics

### Google Analytics 4

1. **https://analytics.google.com** → Admin → Create property → Data streams → Web
2. Salin **Measurement ID** (`G-XXXXXXXXXX`):

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-ABCD1234EF"
```

### Google Search Console Verification

> **Penting:** meta verifikasi GSC dibentuk **saat build**, jadi nilai ini
> wajib ter-export sebelum `next build` / `opennextjs-cloudflare build`.

1. **https://search.google.com/search-console** → Add property → metode **HTML tag**
2. Salin nilai `content=` dari meta tag:

```env
NEXT_PUBLIC_GSC_VERIFICATION="abc123def456ghi789"
```

Setelah deploy, submit `/sitemap.xml` di Search Console.

---

## Monetisasi — Google AdSense

> Iklan **jangan dinyalakan** sebelum Google menyetujui situs. Status saat
> ini (9 Nov 2026): peninjauan ulang sudah diajukan 8 Nov, menunggu hasil
> Google (umumnya 1–2 minggu). Jangan ajukan ulang — mengulang antrean.

```env
NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-8284519503817385"
```

`ads.txt` harus berisi `google.com, pub-8284519503817385, DIRECT, f08c47fec0942fa0`
dan terverifikasi live.

---

## Infrastruktur Cloudflare

Produksi berjalan di **Cloudflare Workers** (akun Free plan), bukan Vercel.

| Resource | Nama | Keterangan |
|----------|------|------------|
| Worker produksi | `agentika` | `agentika.abrahamyusuf-eth.workers.dev` |
| Worker staging | `agentika-staging` | `agentika-staging.abrahamyusuf-eth.workers.dev` |
| R2 (incremental cache) | `agentika-inc-cache` | Cache halaman Next.js (produksi) |
| R2 staging | `agentika-staging-inc-cache` | Cache halaman (staging) |
| KV (tag cache) | `agentika-tag-cache` | Tag cache revalidasi (produksi) |
| KV staging | `agentika-staging-tag-cache` | Tag cache (staging) |
| Custom domain | `www.agentika.web.id` + apex | Apex redirect 308 → www (Redirect Rule `apex-ke-www` di dashboard) |
| Zona DNS | `agentika.web.id` | Nameserver ashton + ivy (Cloudflare) |

Token API Cloudflare (template "Edit Cloudflare Workers" + Workers R2
Storage Edit) disimpan di Secure Vault — **jangan dicatat nilainya di
file mana pun**. Token ini tidak punya izin membuat token API baru maupun
mengubah Rulesets; Redirect Rule apex→www dibuat lewat dashboard.

---

## Deploy

Prosedur deploy (staging dan produksi sama, beda config + bucket):

```bash
# 1. Generate content bundle + export env build-time (GSC WAJIB saat build)
node scripts/generate-content-bundle.mjs
export NEXT_PUBLIC_GSC_VERIFICATION="..." NEXT_PUBLIC_APP_URL="https://www.agentika.web.id"

# 2. Build via adapter OpenNext
npx opennextjs-cloudflare build

# 3. Isi R2 incremental cache (wajib tiap rebuild)
INC_CACHE_BUCKET=agentika-inc-cache python3 scripts/populate-r2-cache.py

# 4. Deploy (JANGAN pakai `opennextjs-cloudflare deploy` langsung —
#    gagal di ensureR2Bucket; pakai wrangler)
OPEN_NEXT_DEPLOY=true wrangler deploy -c wrangler.production.jsonc
# Staging: OPEN_NEXT_DEPLOY=true wrangler deploy   (wrangler.jsonc)
```

Atau pakai skrip yang sudah ada: `cf_deploy_prod.py` (produksi),
`cf_deploy.py` (staging).

### Auto-deploy (GitHub Actions)

Setiap push ke `main` menjalankan `.github/workflows/deploy-production.yml`:
gate dulu (lint + typecheck + tes), lalu prosedur deploy yang sama persis
(prebuild → build OpenNext → populate R2 → `wrangler deploy`).
Bisa juga dipicu manual dari tab Actions → Deploy production → Run workflow.

Satu-satunya yang harus diisi manual: repo secret `CLOUDFLARE_API_TOKEN`
(repo → Settings → Secrets and variables → Actions), token API Cloudflare
dengan template "Edit Cloudflare Workers" + "R2 Storage: Edit" — sama
seperti yang dipakai deploy manual. Tanpa secret ini workflow gagal di
langkah pengecekan token dengan pesan yang jelas.

**Secret produksi** (5 secret, diisi lewat dashboard Cloudflare /
`wrangler secret put`, bukan `.env`): `AI_API_KEY`, `CRON_SECRET`,
`NEWSLETTER_API_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`.

**Secret staging** terpisah (nilai `CRON_SECRET` staging acak sendiri,
`AI_API_KEY` staging = token Workers AI Write khusus staging).

---

## Environment Variables Checklist

| Variabel | Wajib? | Deskripsi |
|----------|--------|-----------|
| `NODE_ENV` | ✅ | `development` / `production` |
| `AI_BASE_URL` | ✅ | Endpoint provider AI (Hcnsec / Workers AI) |
| `AI_API_KEY` | ✅ | Key provider AI (secret produksi via dashboard) |
| `AI_MODEL` | ✅ | Model AI (mis. `MiniMax-M3.1-Flash`, `@cf/meta/llama-3.3-70b-instruct-fp8-fast`) |
| `UPSTASH_REDIS_REST_URL` | 🔵 | Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | 🔵 | Redis REST token |
| `RESEND_API_KEY` | 🔵 | Email sending |
| `NEWSLETTER_API_KEY` | 🔵 | Newsletter (Resend broadcasts) |
| `NEWSLETTER_LIST_ID` | 🔵 | Audience ID newsletter |
| `NEWSLETTER_FROM_EMAIL` | 🔵 | Pengirim welcome email + digest |
| `CRON_SECRET` | 🔵 | Keamanan endpoint cron |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://www.agentika.web.id` (production) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ⬜ | Publisher ID AdSense |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⬜ | Google Analytics ID |
| `NEXT_PUBLIC_GSC_VERIFICATION` | ⬜ | Search Console verification (**wajib saat build**) |
| `NEXT_PUBLIC_GISCUS_*` | ⬜ | Komentar blog via Giscus (opsional) |

**Legend:** ✅ Wajib · 🔵 Direkomendasikan · ⬜ Opsional

---

## Troubleshooting

### AI Chat/Writer menjawab mock ("belum aktif")

- Pastikan `AI_API_KEY` sudah di-set (lokal: `.env.local`; produksi:
  secret Worker). Tanpa key, provider fallback ke mock by design.
- Di produksi, cek `wrangler secret list` — 5 secret harus terisi.

### Meta verifikasi GSC hilang setelah deploy

- `NEXT_PUBLIC_GSC_VERIFICATION` harus ter-export **sebelum build**,
  karena meta dibentuk saat build. Ulangi build dengan env tersebut.

### Deploy gagal di `ensureR2Bucket`

- Jangan pakai `opennextjs-cloudflare deploy` langsung. Pakai prosedur
  di atas: build → `populate-r2-cache.py` → `wrangler deploy` dengan
  `OPEN_NEXT_DEPLOY=true`.

### Halaman tidak ter-update setelah deploy

- Isi ulang R2 cache tiap rebuild (`populate-r2-cache.py`); KV tag cache
  eventually consistent (revalidasi bisa ~60 detik).

### Email newsletter tidak terkirim

- Pastikan `RESEND_API_KEY` valid dan domain `agentika.web.id` sudah
  terverifikasi di Resend (cek DNS records).

---

## Mendapatkan Bantuan

- Docs project: folder `docs/` di repo ini; roadmap: `docs/ROADMAP.md`
- Issue tracker: https://github.com/veragent/Agentika/issues
