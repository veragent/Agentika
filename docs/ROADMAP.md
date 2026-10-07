# 🗺️ ROADMAP — AGENTIKA

> **Platform AI untuk UMKM Indonesia: otomatisasi kerja & side hustle dengan AI.**
> Roadmap ini ditulis ulang pada Oktober 2026 setelah repositioning dari web3ai-hub.
> Setiap fase menghasilkan versi yang *shippable* dan dapat menghasilkan traffic/revenue.
>
> Live: [agentika.web.id](https://www.agentika.web.id) · Stack: Next.js 16 + React 19 + TypeScript + Tailwind v4, konten MDX, deploy Netlify.

---

## Status Legend

| Status | Simbol |
|--------|--------|
| Selesai | ✅ |
| Sebagian / sedang berjalan | 🔄 |
| Direncanakan | 📋 |
| Ide / Backlog | 💡 |
| Dibuang saat pivot | 🗑️ |

---

## 📍 Posisi Saat Ini (Oktober 2026)

Situs sudah **live dan fungsional**. Fondasi teknis selesai; fokus berikutnya adalah
**konten, monetisasi, dan fitur AI** — bukan pembangunan ulang platform.

| Area | Status |
|------|--------|
| Blog (17 artikel ID terbit, MDX, URL flat /blog/slug, hashtag, SEO) | ✅ |
| Learn — 2 track: AI Basics (34 materi) + Prompt Engineering untuk UMKM (5 lesson) | ✅ |
| AI Tools Directory (90 tools, 5 kategori, filter) | ✅ |
| FAQ, newsletter, mobile nav, dark mode | ✅ |
| Search hashtag (/search) — via menu hamburger | ✅ |
| AdSense (konfigurasi ada, aktivasi belum penuh) | 🔄 |
| AI features (SDK terinstal, API belum dibangun) | 📋 |

---

## Phase 0 — Foundation ✅ SELESAI

- ✅ Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui
- ✅ Deploy Netlify + domain agentika.web.id
- ✅ Security headers (CSP, HSTS, X-Frame-Options, dll)
- ✅ SEO dasar: sitemap dinamis, robots.txt, OG image generator, canonical URL
- ✅ Google Analytics 4
- ✅ Dark/light mode, hamburger menu, mobile bottom nav, footer
- ✅ Konten 100% berbahasa Indonesia, fokus UMKM (duplikat EN di-unpublish, kategori Web3 dihapus)

---

## Phase 1 — Content Engine 🔄 (Q4 2026)

> **Goal:** Jadi rujukan konten AI praktis untuk UMKM Indonesia. Konten adalah SEO.

### Blog
- ✅ MDX pipeline, listing, detail, hashtag/tag
- ✅ URL blog flat (`/blog/<slug>`) + redirect 301 dari URL kategori lama
- ✅ Tampilan kategori dihapus (badge & filter); navigasi artikel via hashtag
- ✅ Halaman `/search` dengan pencarian hashtag (#tag) & kata kunci
- ✅ Syntax highlighting (Shiki), reading time, newsletter CTA
- 📋 Tambah hingga **30+ artikel ID** (sekarang 17 terbit): fokus tutorial langkah-demi-langkah
  - Otomatisasi order (WhatsApp → spreadsheet, dst.)
  - Prompt template siap pakai per jenis usaha (kuliner, fashion, jasa)
  - Studi kasus UMKM (format seperti "Bu Siti naik 3x omzet")
- 📋 Konsistensi editorial: 2 artikel/minggu

### Learn Tracks
- ✅ Struktur GitBook-style: sidebar, prev/next navigation
- ✅ Track **AI Basics** (34 materi: AI intro, prompt engineering, LLM & API, RAG, fine-tuning, AI agents, etika)
- ✅ Track **Prompt Engineering untuk UMKM** (5 lesson: dasar prompt, formula 5 elemen, template kuliner/fashion/jasa)
- 📋 Track **AI Automation** — Make/Zapier/n8n untuk operasional UMKM
- 📋 Track **No-Code Tools** — bangun landing page, chatbot, katalog tanpa coding
- 📋 Progress tracker sederhana (localStorage)

**Deliverable:** 30+ artikel, 3 track learn lengkap. 🎉

---

## Phase 2 — AI Tools Directory+ 🔄 (Q4 2026 – Q1 2027)

> **Goal:** Direktori AI tools terlengkap untuk UMKM Indonesia.

- ✅ 90 tools, 5 kategori, filter client-side, featured tools, pricing badge
- 📋 Halaman detail per tool: fitur utama, pro/kontra, alternatif, link affiliate
- 📋 Fitur **Compare Tools** (maksimal 3 tool side-by-side, URL shareable)
- 📋 Tambah koleksi hingga **150+ tools**, prioritaskan tools yang relevan untuk UMKM
- 📋 Badge "Baru minggu ini" dan kurasi "Pilihan untuk UMKM"

**Deliverable:** Direktori 150+ tools dengan halaman detail & compare. 🛠️

---

## Phase 3 — Monetisasi 📋 (Q1 2027)

> **Goal:** Revenue stream pertama berjalan.

- 🔄 Google AdSense: komponen `AdSlot` + konfigurasi per section sudah ada
- 📋 **Perbaiki konflik CSP vs AdSense** (domain googleads/googlesyndication belum diizinkan) — prasyarat aktivasi
- 📋 Aktivasi Publisher ID + slot ID production
- 📋 Program affiliate terstruktur: tracking klik, laporan konversi
- 📋 Sponsored listing untuk AI tools (paid featured)
- 📋 Media kit / rate card sederhana

**Deliverable:** AdSense aktif + affiliate berjalan. 💰

---

## Phase 4 — AI Features 📋 (Q1–Q2 2027)

> **Goal:** Manfaatkan SDK AI yang sudah terinstal untuk pengalaman personal.

SDK sudah tersedia: OpenAI, Anthropic, Google, Vercel AI SDK (multi-provider).
API key dikonfigurasi via environment variables.

- 📋 **AI Chat Sidebar di Learn** — tanya jawab dengan konteks halaman yang sedang dibaca (streaming)
- 📋 **AI Writer** — generate draft artikel dari topik (mendukung PRD konten Phase 1)
- 📋 **Template Prompt Generator** — user isi kebutuhan usaha → dapat prompt siap pakai
- 📋 Rate limiting & guardrail biaya per fitur

**Deliverable:** 3 fitur AI live dengan kontrol biaya. 🤖

---

## Phase 5 — Growth & Engagement 📋 (Q2 2027+)

> **Goal:** Tumbuhkan traffic organik dan retensi.

- 🔄 Global search: pencarian hashtag blog (`/search`) ✅; cakupan learn + tools (Fuse.js) belum 📋
- 📋 Newsletter automation: welcome series + weekly digest (Resend)
- 📋 Komentar artikel (Giscus — berbasis GitHub Discussions)
- 📋 SEO scale: internal linking otomatis, schema markup lanjutan, Core Web Vitals audit
- 📋 Komunitas: channel Telegram/Discord untuk UMKM
- 📋 Kuis "AI readiness" untuk UMKM → rekomendasi track belajar personal

**Deliverable:** Search + newsletter automation + komunitas aktif. 📈

---

## 🗑️ Dibuang Saat Pivot (tidak dikerjakan)

Item-item dari roadmap web3ai-hub lama yang **sengaja tidak dibawa**:

- Airdrop Hub + step tracker + bounty board
- Track Web3 (Blockchain Basics, DeFi, NFT, DAO)
- Admin dashboard + NextAuth + Prisma/Neon database
- Deploy Vercel, Cloudflare R2, Umami analytics
- Wallet connect, live crypto price

*Jika suatu saat dibutuhkan kembali, akan dievaluasi sebagai proyek terpisah.*

---

## Prioritas Fitur (MoSCoW)

### Must Have (3 bulan ke depan)
- Konten: 30+ artikel ID, 3 learn track lengkap
- AI Tools: halaman detail + 150 tools
- Monetisasi: AdSense aktif (setelah fix CSP)

### Should Have
- AI chat sidebar di Learn
- Global search
- Progress tracker learn

### Could Have
- AI Writer untuk tim konten
- Komentar (Giscus)
- Newsletter automation

### Won't Have
- Airdrop Hub / fitur crypto
- Mobile app native
- Forum diskusi
- User accounts & login (konten tetap publik tanpa auth)

---

*Roadmap ini adalah dokumen hidup. Prioritas dapat berubah berdasarkan feedback pengguna dan data traffic.*
*Ditulis ulang Oktober 2026 — menggantikan roadmap web3ai-hub versi sebelumnya.*
