import type { Metadata } from "next"
import Link from "next/link"
import { generateSeo } from "@/lib/seo"

export const metadata: Metadata = generateSeo({
  title: "Tentang AGENTIKA",
  description:
    "AGENTIKA adalah platform AI untuk UMKM dan side hustle Indonesia: direktori tools AI, tutorial otomatisasi, dan artikel strategi yang dicek dulu sebelum direkomendasikan.",
  type: "website",
  canonical: "/tentang",
})

export default function TentangPage() {
  return (
    <section className="container py-8">
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tentang AGENTIKA
          </h1>
          <p className="mt-4 text-muted-foreground">
            AGENTIKA adalah platform AI untuk UMKM dan side hustle Indonesia.
            Isinya tiga hal: direktori tools AI, tutorial otomatisasi, dan
            artikel strategi usaha — semuanya ditulis supaya pemilik usaha
            bisa memutuskan dengan cepat dan tanpa hype.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Untuk siapa</h2>
          <p className="text-muted-foreground">
            Untuk pemilik usaha kecil dan pekerja mandiri yang punya satu
            pekerjaan spesifik — misalnya membalas chat pelanggan, merapikan
            pesanan, atau membuat konten — dan ingin tahu tool apa yang
            tepat, berapa biayanya, dan apa yang harus diverifikasi sebelum
            dipakai.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Cara kami bekerja</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Setiap tool dicek dulu sebelum direkomendasikan: fitur utama,
              harga, kelebihan, dan kekurangannya.
            </li>
            <li>
              Artikel menyatakan apa yang benar-benar diuji, bukan sekadar
              klaim dari halaman pemasaran tool.
            </li>
            <li>
              Angka sebelum klaim, dan verifikasi sebelum menandatangani,
              mempublikasikan, atau membayar apa pun.
            </li>
            <li>
              Halaman tool yang belum lengkap datanya tidak kami promosikan
              ke mesin pencari sampai dilengkapi.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Yang bukan kami</h2>
          <p className="text-muted-foreground">
            AGENTIKA bukan penasihat keuangan, hukum, atau pajak. Rekomendasi
            tool di situs ini bersifat informasi; keputusan akhir tetap di
            pembaca. Harga dan fitur tool bisa berubah sewaktu-waktu, jadi
            selalu cek situs resmi tool sebelum berlangganan.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Pengelola</h2>
          <p className="text-muted-foreground">
            AGENTIKA dikelola oleh tim Veragent. Koreksi, usulan tool, atau
            ajakan kerja sama bisa dikirim lewat{" "}
            <Link href="/kontak" className="text-primary hover:underline">
              halaman kontak
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
