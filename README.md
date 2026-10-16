# Ruang Soal — Pembuat Soal SD

Aplikasi bank soal berbahasa Indonesia untuk guru Sekolah Dasar. Versi ini menggunakan **PostgreSQL** dan disiapkan untuk **Vercel**. Versi SQLite lokal sebelumnya disimpan terpisah.

## Fitur

- Dashboard jumlah soal dan lembar tersimpan.
- CRUD soal kelas 1–6: pilihan ganda A–D, isian singkat, dan uraian.
- Mata pelajaran, topik, kunci jawaban, serta pembahasan.
- Pencarian tanpa membedakan huruf besar/kecil dan filter kelas, pelajaran, jenis, serta contoh.
- Penyusun lembar dengan judul, petunjuk, pemilihan soal, dan pengaturan urutan.
- Salinan isi soal pada lembar tetap utuh saat bank diedit atau dihapus.
- Pratinjau dan cetak A4; kunci jawaban dicetak terpisah.
- Validasi server, pesan sukses/gagal, konfirmasi hapus, dan tampilan responsif.
- Seed opsional 12 soal contoh pada enam kelas dan empat mata pelajaran.

## Teknologi

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma ORM 6, PostgreSQL, dan Zod 3. Gunakan Node.js 22.12+ atau 24.x beserta npm. Dependensi dikunci dalam `package-lock.json`.

## Deploy ke Vercel

Panduan lengkap: [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md).

1. Import repository **Falz6767/ruang-soal** melalui [Vercel New Project](https://vercel.com/new).
2. Siapkan PostgreSQL melalui penyedia yang tersedia di Vercel Marketplace, misalnya Prisma Postgres.
3. Hubungkan integrasinya ke environment Production. Prisma Postgres otomatis membuat **DATABASE_URL** dan **POSTGRES_URL** yang dipakai aplikasi. Untuk penyedia lain, isi kedua variabel secara manual.
4. Gunakan Root Directory bawaan, Framework Next.js, dan Build Command `npm run vercel-build`.
5. Deploy. Skrip membuat Prisma Client, menerapkan migrasi PostgreSQL, lalu membangun Next.js.

Database berada pada PostgreSQL permanen, bukan filesystem Vercel. Jangan mengunggah kredensial database ke GitHub.

## Menjalankan di komputer

Siapkan PostgreSQL lokal atau database pengembangan terpisah dari produksi.

```powershell
git clone https://github.com/Falz6767/ruang-soal.git
cd ruang-soal
Copy-Item .env.example .env
```

Edit `.env`, isi koneksi PostgreSQL yang benar, kemudian:

```powershell
npm ci
npm run db:deploy
npm run db:seed
npm run dev
```

Buka http://127.0.0.1:3000. Pada macOS/Linux gunakan `cp .env.example .env`. Seed hanya menambah contoh yang belum tersedia, tidak menggandakan atau menimpa contoh yang masih ada. Seed ulang akan mengembalikan contoh yang telah dihapus; seed tidak dijalankan otomatis saat deploy.

Untuk mengembangkan skema, gunakan `npm run db:migrate -- --name nama_perubahan` pada database pengembangan.

## Pengujian

```powershell
npm run check
npm run build
npm run start
```

Di terminal kedua, saat server aktif:

```powershell
npm run test:api
```

Tes memeriksa CRUD, validasi, filter, urutan lembar, salinan soal, serta pratinjau dan membersihkan data buatannya sendiri. Jalankan pada database pengembangan. Hentikan server sebelum mengulang build di Windows agar mesin Prisma tidak terkunci.

GitHub Actions memeriksa migrasi, seed, TypeScript, build, dan API menggunakan PostgreSQL 17 pada push ke `main` dan pull request. Database CI bersifat sementara dan tidak memakai kredensial produksi.

## Struktur utama

```text
.github/workflows/ci.yml       Pemeriksaan otomatis dengan PostgreSQL
prisma/schema.prisma          Model dan koneksi PostgreSQL
prisma/migrations/            Migrasi PostgreSQL
prisma/seed.ts                Contoh soal berbahasa Indonesia
src/app/                     Halaman App Router dan API
src/components/              Formulir, penyusun lembar, dan dialog
src/lib/                     Prisma, validasi, tipe, dan repository
tests/api-smoke.mjs           Pengujian alur melalui HTTP
vercel.json                  Konfigurasi build Vercel
.env.example                 Contoh variabel tanpa rahasia
DEPLOY_VERCEL.md              Panduan deployment
```

## Akses satu guru

Aplikasi tidak memiliki login internal. Orang yang dapat membuka deployment dapat melihat, menambah, mengubah, dan menghapus seluruh data. Untuk pemakaian pribadi, atur Deployment Protection Vercel agar seluruh deployment, termasuk domain produksi, hanya dapat dibuka oleh pengguna yang diizinkan. Repository publik tidak mengharuskan data aplikasi terbuka untuk umum.

## Cetak

Buka lembar tersimpan → **Pratinjau** → **Cetak lembar soal**. Pilih A4, orientasi potret, lalu printer atau Simpan sebagai PDF. Nonaktifkan header/footer browser untuk hasil bersih. Pilih **Kunci jawaban terpisah** untuk mencetak kunci guru.
