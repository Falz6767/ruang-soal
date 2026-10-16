import Link from "next/link";
import { Plus, Files } from "lucide-react";
import { listWorksheets } from "@/lib/repository";
import { param, type SearchParams } from "@/lib/page-data";
import Notice from "@/components/Notice";
import DeleteButton from "@/components/DeleteButton";
export const metadata = { title: "Lembar soal" };
export default async function Worksheets({ searchParams }: { searchParams: SearchParams }) {
  const [worksheets, params] = await Promise.all([listWorksheets(), searchParams]);
  return <div className="stack page-stack"><div className="page-heading"><div><p className="eyebrow">SIAP DIBAWA KE KELAS</p><h1>Lembar soal</h1><p className="lead">Kumpulan latihan yang Anda susun untuk siswa.</p></div><Link href="/lembar/baru" className="btn btn-primary"><Plus size={18} /> Susun lembar baru</Link></div><Notice message={param(params.pesan)} />
    {worksheets.length ? <div className="worksheet-grid">{worksheets.map((sheet) => <article key={sheet.id} className="panel worksheet-card"><Files size={26} className="text-forest" /><span className="muted text-sm">{sheet.items.length} soal</span><h2><Link href={`/lembar/${sheet.id}/pratinjau`}>{sheet.title}</Link></h2><p className="muted">{sheet.instructions ? sheet.instructions.slice(0, 140) : "Tanpa petunjuk tambahan."}</p><div className="row mt-auto"><Link href={`/lembar/${sheet.id}/pratinjau`} className="btn btn-primary">Pratinjau</Link><Link href={`/lembar/${sheet.id}/ubah`} className="btn btn-secondary">Ubah</Link><DeleteButton url={`/api/lembar/${sheet.id}`} redirectTo="/lembar?pesan=Lembar%20soal%20berhasil%20dihapus." confirmMessage={`Hapus lembar “${sheet.title}”? Semua soal di bank soal tetap tersimpan.`} label="Hapus" /></div></article>)}</div> : <div className="empty-state"><Files size={36} className="mx-auto mb-4 text-forest" /><h2>Lembar pertama Anda menanti</h2><p>Pilih soal dari bank, beri judul, lalu cetak untuk siswa.</p><Link href="/lembar/baru" className="btn btn-primary">Susun lembar soal</Link></div>}
  </div>;
}
