# Deploy Ruang Soal ke Vercel

Versi ini memakai PostgreSQL permanen. File SQLite dari aplikasi lokal tidak diunggah dan tidak otomatis dipindahkan ke database baru.

## 1. Import repository

Masuk ke akun Vercel, buka https://vercel.com/new, lalu import **Falz6767/ruang-soal**. Gunakan Framework **Next.js** dan Root Directory bawaan (akar repository). Hubungkan akun GitHub sendiri jika Vercel memintanya.

## 2. Hubungkan PostgreSQL

Gunakan PostgreSQL yang sudah dimiliki atau penyedia melalui [Vercel Marketplace](https://vercel.com/marketplace/category/storage), misalnya Neon. Periksa harga dan paket penyedia sebelum menyetujuinya.

Siapkan dua variabel untuk environment **Production**:

| Nama | Nilai |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL untuk aplikasi; integrasi Prisma menyediakan URL ini otomatis. |
| `POSTGRES_URL` | URL PostgreSQL langsung/non-pooled untuk migrasi. |

Integrasi Prisma Postgres otomatis membuat `DATABASE_URL` dan `POSTGRES_URL` ketika dihubungkan ke project. Keduanya berisi koneksi langsung sehingga deployment dapat berjalan tanpa menyalin rahasia. Aplikasi membatasi satu koneksi per instance. Untuk trafik lebih besar, tambahkan URL pooled untuk aplikasi sesuai petunjuk penyedia; pertahankan koneksi langsung untuk migrasi. Untuk penyedia lain, isi kedua variabel secara manual. Jangan memakai contoh localhost dari `.env.example` pada Vercel.

Gunakan SSL sesuai petunjuk penyedia, biasanya `sslmode=require`. Untuk serverless gunakan pooled endpoint, dan `connection_limit=1` bila disarankan penyedia. Kedua URL boleh sama jika database tidak mempunyai pooler dan koneksi langsung memang didukung; perhatikan batas koneksinya.

Simpan URL pada **Project → Settings → Environment Variables**. Jangan menaruh kredensial dalam README, issue, kode sumber, atau percakapan publik. Perubahan variabel memerlukan redeploy.

## 3. Build dan deploy

`vercel.json` sudah mengatur:

```text
Install Command: npm ci
Build Command:   npm run vercel-build
```

Skrip build menjalankan `prisma generate`, `prisma migrate deploy`, lalu `next build --webpack`. Pilih Node.js 22 atau 24 yang tersedia. Tekan Deploy setelah kedua variabel terisi.

Migrasi membuat tabel `Question`, `Worksheet`, dan `WorksheetItem`, lalu menambahkan 12 soal contoh berlabel satu kali tanpa menimpa data yang ada. Data tetap berada pada PostgreSQL saat deployment berikutnya dibuat. Contoh yang dihapus tidak muncul kembali pada deploy berikutnya karena migrasi data hanya dijalankan sekali.

Untuk memulihkan contoh yang sebelumnya dihapus, isi `.env` lokal dengan database tujuan yang benar lalu jalankan:

```powershell
npm ci
npm run db:seed
```

Perintah seed manual tidak otomatis berjalan setiap deploy. Contoh baru pada database kosong ditangani migrasi data satu kali.

## 4. Akses aplikasi pribadi

Aplikasi tidak memiliki login internal. Jika domain dibuka untuk umum, setiap pengunjung juga dapat menggunakan seluruh CRUD. Untuk pemakaian pribadi, buka **Settings → Deployment Protection** dan pilih perlindungan yang mencakup semua deployment serta domain produksi sesuai opsi akun Vercel. Periksa melalui jendela privat bahwa domain produksi meminta akses yang sesuai.

Repository GitHub publik hanya berisi kode dan contoh seed. `.env`, kredensial, SQLite, dependensi, dan hasil build tidak diunggah.

## 5. Uji deployment

1. Buat soal pilihan ganda dengan empat opsi berbeda dan kunci A–D.
2. Muat ulang halaman; soal harus tetap tersedia.
3. Cari soal dan gunakan filter kelas, pelajaran, serta jenis.
4. Susun lembar, ubah urutan, simpan, dan buka kembali.
5. Periksa pratinjau siswa serta kunci terpisah.
6. Lakukan redeploy lalu pastikan data yang dibuat tetap tersedia.

Tes API otomatis dijalankan GitHub Actions pada database PostgreSQL sementara. Untuk pengujian otomatis lokal, gunakan database pengembangan yang terpisah dari produksi.

## Preview deployment

Gunakan database atau branch database **terpisah** untuk Preview. Skrip build menerapkan migrasi, sehingga kredensial produksi pada Preview dapat mengubah skema produksi. Isi pasangan `DATABASE_URL` dan `POSTGRES_URL` khusus Preview, atau jangan aktifkan preview sampai database pengembangan tersedia.

## Jika build gagal

- **Environment variable not found:** isi `DATABASE_URL` dan `POSTGRES_URL` untuk environment yang dibangun, lalu redeploy.
- **P1001/cannot reach database:** periksa host, port, SSL, dan izin jaringan dari Vercel.
- **Migrasi gagal melalui pooler:** arahkan `POSTGRES_URL` ke endpoint direct/non-pooled.
- **Tabel belum tersedia:** pastikan Build Command `npm run vercel-build`; periksa langkah migrasi pada log.
- **Prisma tidak ditemukan:** jangan memakai `npm ci --omit=dev` saat build; Prisma CLI dan compiler diperlukan.
- **Bank kosong setelah contoh dihapus:** buat soal sendiri atau jalankan seed manual untuk memulihkan contoh.
- **Data berbeda antar domain:** periksa database environment Production dan Preview.

## Referensi

- [PostgreSQL di Vercel](https://vercel.com/docs/postgres)
- [Prisma 6 di Vercel](https://www.prisma.io/docs/orm/v6/prisma-client/deployment/serverless/deploy-to-vercel)
- [Prisma PostgreSQL connector](https://www.prisma.io/docs/orm/v6/overview/databases/postgresql)
- [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection)
