import Link from "next/link";
export default function NotFound() {
  return <div className="empty-state"><p className="eyebrow">404</p><h1>Halaman tidak ditemukan</h1><p>Soal atau lembar ini mungkin sudah dihapus.</p><Link className="btn btn-primary" href="/">Kembali ke dashboard</Link></div>;
}
