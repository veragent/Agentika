# 🌐 AGENTIKA — Platform AI untuk UMKM Indonesia

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Platform AI untuk UMKM Indonesia: otomatisasi kerja & side hustle dengan AI.**

Blog · Learning Tracks · AI Tools Directory

[Live Site](https://www.agentika.web.id) · [Dokumentasi](#) · [Roadmap](./docs/ROADMAP.md) · [Kontribusi](#contributing)

</div>

---

## ✨ Tentang Proyek

**AGENTIKA** adalah platform konten modern yang dibangun dengan Next.js, dirancang khusus untuk membantu UMKM dan pebisnis online Indonesia memanfaatkan AI. Platform ini menggabungkan blog berbasis MDX, learning tracks terstruktur, dan direktori AI tools — semuanya fokus pada otomatisasi kerja, produktivitas, dan strategi side hustle yang praktis dan bisa langsung diterapkan.

Platform ini juga dirancang untuk **menghasilkan pendapatan** melalui Google AdSense, affiliate links, dan sponsored content.

---

## 🚀 Fitur Utama

### 📝 Blog (MDX-Powered)
- Tulis post dengan format Markdown / MDX yang kaya fitur
- Kategorisasi, tagging, dan SEO otomatis (sitemap, OG image, canonical URL)
- Google AdSense terintegrasi dan dapat dikonfigurasi per section
- Syntax highlighting untuk kode dengan Shiki
- Estimated reading time dan newsletter signup
- Profil penulis via metadata `authors`

### 📚 Learn / Tutorial (GitBook-style)
- Dokumentasi bertingkat dengan navigasi sidebar yang intuitif
- Track tersedia: **AI Basics** — mencakup Prompt Engineering, LLM & API, RAG, Fine-tuning, Machine Learning, dan AI Agents
- Dukungan AdSense di halaman dokumentasi

### 🛠️ AI Tools Directory
- Direktori 90 AI tools dalam 5 kategori
- Kategori: Writing & Content, Coding & Development, Image Generation, Video Generation, Audio & Music
- Badge pricing (Free / Freemium / Paid), rating, dan affiliate link
- Filter client-side per kategori + daftar featured tools

### ❓ FAQ
- Halaman FAQ yang dikelola dari `content/config/faq.json`

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Content** | MDX + gray-matter + next-mdx-remote |
| **AI SDKs** | Vercel AI SDK + OpenAI, Anthropic, Google (terinstal; integrasi API menyusul) |
| **Animation** | Framer Motion |
| **Deploy** | Netlify |
| **Analytics** | Google Analytics 4 (via @next/third-parties) |
| **Email** | Resend |

---

## 🤖 AI Provider yang Didukung

SDK berikut sudah terinstal dan siap dipakai saat API route AI dibangun:

```
✅ OpenAI        — openai SDK
✅ Anthropic     — @anthropic-ai/sdk
✅ Google        — @google/generative-ai
✅ Vercel AI SDK — ai (multi-provider abstraction)
```

API key dikonfigurasi via environment variables (lihat `.env.example`).

---

## 📁 Struktur Project

```
AGENTIKA/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Route group publik
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── blog/              # Blog listing & detail
│   │   │   ├── learn/             # Learning tracks
│   │   │   ├── ai-tools/          # AI tools directory
│   │   │   ├── faq/               # FAQ
│   │   │   └── layout.tsx
│   │   └── api/                   # API routes
│   │       ├── newsletter/subscribe/
│   │       └── og/[type]/         # OG image generator
│   ├── components/                # React components
│   │   ├── ads/                   # AdSlot (AdSense)
│   │   ├── ai-tools/              # ToolsFilter
│   │   ├── blog/
│   │   ├── layout/
│   │   ├── mdx/
│   │   ├── newsletter/
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/                       # Utilities & helpers
│   │   ├── ai-tools.ts            # Data direktori AI tools (static)
│   │   ├── blog.ts / learn.ts     # MDX content loaders
│   │   ├── ads.ts                 # Konfigurasi AdSense
│   │   └── seo.ts / env.ts
│   └── types/
├── content/                       # Konten MDX
│   ├── blog/                      # Post blog (.mdx)
│   ├── learn/
│   │   └── ai-basics/             # Track AI Basics
│   └── config/                    # adsense.json, faq.json
├── docs/                          # Dokumentasi proyek
├── e2e/                           # Playwright E2E tests
├── tests/                         # Unit tests
└── public/
```

---

## 🚀 Quick Start

### Prasyarat
- Node.js 18+
- API Key AI provider (opsional, untuk fitur AI mendatang)

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/veragent/Agentika.git
cd Agentika

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan konfigurasi kamu

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

```env
# AI Providers (untuk fitur AI mendatang — isi minimal satu)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""
GROQ_API_KEY=""

# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-XXXXXXXXXX"

# Analytics (Google Analytics 4)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
# Google Search Console verification
NEXT_PUBLIC_GSC_VERIFICATION="google-site-verification-token"

# Email (Resend — untuk newsletter)
RESEND_API_KEY=""

# Newsletter provider (opsional)
NEWSLETTER_PROVIDER=""
NEWSLETTER_API_KEY=""

# Discord / Telegram (opsional — untuk notifikasi)
DISCORD_WEBHOOK_URL=""
TELEGRAM_BOT_TOKEN=""

# App URL (untuk sitemap, OG, canonical)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Lihat `.env.example` untuk daftar lengkap.

---

## 🧭 Environment Modes

Aplikasi mendukung tiga mode runtime:

| Mode | Tujuan | Catatan |
|------|--------|---------|
| `development` | Pengembangan lokal | Salin `.env.example` ke `.env.local`. |
| `staging` | Preview/UAT sebelum production | Gunakan service eksternal yang sama seperti production untuk validasi integrasi. |
| `production` | Environment live pengguna akhir | Semua secret harus diisi melalui platform deploy (mis. Netlify env). |

---

## 💰 Strategi Monetisasi

| Sumber | Deskripsi | Estimasi |
|--------|-----------|----------|
| **Google AdSense** | Auto-placed ads di blog, docs, tools | Variabel |
| **Affiliate Links** | Referral ke AI tools & layanan | 5-30% komisi |
| **Sponsored Listing** | Tool berbayar masuk direktori | Flat fee |
| **Premium Content** | Akses eksklusif ke konten advanced | Subscription |

---

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Linting
npm run typecheck    # TypeScript check (quality gate)
npm run test         # Node.js test runner
npm run test:e2e     # Playwright E2E tests
npm run analyze      # Bundle analyzer
npm run setup-hooks  # Aktifkan pre-commit hook lokal
```

---

## 🤝 Contributing

Kontribusi sangat disambut! Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan lengkap.

1. Fork repo ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📄 License

MIT License — lihat [LICENSE](./LICENSE) untuk detail.

---

<div align="center">
Dibuat dengan ❤️ untuk UMKM Indonesia
</div>
