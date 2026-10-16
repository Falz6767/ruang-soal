"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="empty-state" role="alert"><h1>Halaman belum dapat dimuat</h1><p>Coba lagi. Jika masalah berlanjut, pastikan migrasi database sudah dijalankan dan periksa terminal aplikasi.</p><div className="row justify-center"><button className="btn btn-primary" onClick={reset}>Coba lagi</button><Link href="/" className="btn btn-secondary">Ke dashboard</Link></div></div>;
}
