# Launch Checklist — AGENTIKA

> Checklist sebelum dan sesudah deploy ke production
> (Cloudflare Workers). Terakhir diperbarui: 9 Nov 2026.

## 1. Gate kode

- [ ] `npm run typecheck` lolos
- [ ] `npm run test` lolos (23 unit test)
- [ ] `npm run lint` lolos
- [ ] `npm run build` lolos

## 2. Environment dan secret

- [ ] 5 secret produksi terisi di dashboard Cloudflare / `wrangler secret list`:
      `AI_API_KEY`, `CRON_SECRET`, `NEWSLETTER_API_KEY`, `RESEND_API_KEY`,
      `UPSTASH_REDIS_REST_TOKEN`
- [ ] Env build-time ter-export **sebelum build**:
      `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_APP_URL`,
      `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_ADSENSE_CLIENT`

## 3. Domain dan DNS

- [ ] Zona `agentika.web.id` status active di Cloudflare
- [ ] Apex `agentika.web.id` redirect 308 → `https://www.agentika.web.id`
      (Redirect Rule `apex-ke-www` aktif)
- [ ] Custom domain `www` + apex terpasang di Worker `agentika`

## 4. SEO dan konten

- [ ] `robots.txt` dan `/sitemap.xml` mengembalikan URL produksi
- [ ] Halaman blog, learn, dan AI tools punya canonical metadata
- [ ] Sitemap sudah di-submit di Google Search Console setelah deploy

## 5. Monetisasi

- [ ] `ads.txt` live dan benar
      (`google.com, pub-8284519503817385, DIRECT, f08c47fec0942fa0`)
- [ ] Iklan **jangan dinyalakan** sebelum Google menyetujui situs
- [ ] Link afiliasi keluar lewat `/go/<slug>` dan tercatat kliknya

## 6. Smoke test setelah deploy

- [ ] Home, `/blog`, satu artikel, `/faq` mengembalikan 200
- [ ] `/go/<slug>` yang punya affiliateLink redirect 302;
      tanpa affiliateLink mengembalikan 404 (by design)
- [ ] Learn Chat menjawab mode `provider` (bukan mock)
- [ ] AI Writer menghasilkan draf mode `live` (bukan demo)
- [ ] Form newsletter subscribe mengirim welcome email
