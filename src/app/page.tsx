import Link from "next/link";
import { ArrowRight, Plus, BookOpen, Files, PencilLine } from "lucide-react";
import { db } from "@/lib/db";
import { serializeQuestion } from "@/lib/repository";
import { QuestionMeta } from "@/components/QuestionContent";

export default async function Dashboard() {
  const [total, worksheets, examples, recent] = await Promise.all([
    db.question.count(), db.worksheet.count(), db.question.count({ where: { isExample: true } }),
    db.question.findMany({ take: 4, orderBy: { updatedAt: "desc" } }),
  ]);
  return <div className="stack page-stack">
    <div className="page-heading"><div><p className="eyebrow">SELAMAT DATANG, BAPAK / IBU GURU</p><h1>Ide mengajar dimulai<br className="desktop-break" /> dari soal yang baik.</h1><p className="lead">Simpan ide, susun latihan, dan siapkan lembar soal.<br className="desktop-break" /> Semua ada di ruang kerja Anda.</p></div><Link href="/soal/baru" className="btn btn-primary"><Plus size={18} /> Buat soal baru</Link></div>
    <section className="stats-grid" aria-label="Ringkasan koleksi">
      <div className="stat"><BookOpen size={23} /><div><strong>{total}</strong><span>Soal tersimpan</span></div></div>
      <div className="stat"><Files size={23} /><div><strong>{worksheets}</strong><span>Lembar soal</span></div></div>
      <div className="stat stat-note"><span className="note-symbol" aria-hidden="true">✦</span><div><strong>Siap untuk kelas 1–6</strong><span>Pilihan ganda, isian, dan uraian.</span></div></div>
    </section>
    <section className="start-banner"><div><p className="eyebrow">DARI BANK SOAL KE RUANG KELAS</p><h2>Satu lembar, banyak pengetahuan.</h2><p>Pilih soal, atur urutannya, lalu cetak untuk siswa Anda.</p><Link href="/lembar/baru" className="btn btn-primary">Susun lembar soal <ArrowRight size={18} /></Link></div><div className="paper-illustration" aria-hidden="true"><PencilLine size={31} /><span>LEMBAR LATIHAN</span><i /><i /><i /><i /><b>A&nbsp;&nbsp; B&nbsp;&nbsp; C&nbsp;&nbsp; D</b></div></section>
    <section><div className="section-heading"><div><h2>Soal yang baru disimpan</h2><p className="muted">Lanjutkan dari ide terakhir Anda.</p></div><Link href="/soal" className="text-link">Lihat bank soal <ArrowRight size={16} /></Link></div>
      {recent.length ? <div className="question-list">{recent.map((row) => {const question = serializeQuestion(row); return <Link href={`/soal/${question.id}`} key={question.id} className="question-row"><div><QuestionMeta question={question} /><h3>{question.text.length > 150 ? `${question.text.slice(0, 150)}…` : question.text}</h3></div><ArrowRight size={20} aria-hidden="true" /></Link>;})}</div> : <div className="empty-state"><h3>Mulai koleksi soal Anda</h3><p>Soal pertama bisa menjadi awal pembelajaran yang menyenangkan.</p><Link className="btn btn-primary" href="/soal/baru">Buat soal pertama</Link></div>}
    </section>
    {examples > 0 && <p className="seed-note"><span className="badge badge-example">Contoh seed</span> Ada {examples} soal contoh untuk dicoba. Temukan melalui filter “Soal contoh” di bank soal dan hapus kapan saja.</p>}
  </div>;
}
