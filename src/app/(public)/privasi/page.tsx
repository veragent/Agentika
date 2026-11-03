import type { Metadata } from "next"
import Link from "next/link"
import { generateSeo } from "@/lib/seo"

export const metadata: Metadata = generateSeo({
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi AGENTIKA: data apa yang dikumpulkan (buletin, komentar, analitik, pembatasan laju), cookie, dan cara menghubungi kami.",
  type: "website",
  canonical: "/privasi",
})

export default function PrivasiPage() {
  return (
    <section className="container py-8">
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Kebijakan Privasi
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Terakhir diperbarui: 3 November 2026. Pengelola situs: tim
            Veragent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Data yang kami kumpulkan
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <strong>Buletin:</strong> alamat email yang Anda daftarkan
              untuk buletin, disimpan lewat layanan Resend dan hanya dipakai
              untuk mengirim buletin. Anda bisa berhenti berlangganan lewat
              tautan di setiap email.
            </li>
            <li>
              <strong>Komentar:</strong> komentar di artikel memakai Giscus,
              yang berjalan di atas akun GitHub Anda. Data akun GitHub
              dikelola oleh GitHub sesuai kebijakannya sendiri.
            </li>
            <li>
              <strong>Analitik:</strong> situs ini memakai Google Analytics
              untuk memahami halaman apa yang dikunjungi, tanpa
              mengidentifikasi pengunjung secara pribadi.
            </li>
            <li>
              <strong>Pembatasan laju:</strong> untuk fitur AI (chat,
              penulis, generator prompt), alamat IP dipakai sementara hanya
              untuk membatasi jumlah permintaan per waktu, lalu kedaluwarsa
              bersama jendela batasnya. IP tidak dipakai untuk profiling.
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Situs ini tidak memiliki sistem akun, jadi kami tidak menyimpan
            kata sandi atau profil pengguna.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Cookie</h2>
          <p className="text-muted-foreground">
            Situs memakai cookie fungsional dan analitik. Anda bisa memblokir
            cookie dari pengaturan peramban, dengan catatan beberapa fitur
            (misalnya komentar) mungkin tidak berjalan penuh. Jika di masa
            depan situs menampilkan iklan Google AdSense, Google dan
            mitranya dapat menggunakan cookie untuk penayangan iklan sesuai
            Kebijakan Privasi Google.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Tautan pihak ketiga</h2>
          <p className="text-muted-foreground">
            Halaman tool menautkan ke situs resmi masing-masing tool, dan
            situs ini menautkan ke X dan GitHub. Kebijakan privasi situs
            tujuan berlaku masing-masing dan di luar kendali kami.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Perubahan kebijakan</h2>
          <p className="text-muted-foreground">
            Kebijakan ini dapat diperbarui sewaktu-waktu; tanggal di atas
            menunjukkan versi terakhir. Pertanyaan soal kebijakan ini bisa
            dikirim lewat{" "}
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
