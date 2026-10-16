import Link from "next/link";
import { Plus, Search, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { listQuestions } from "@/lib/repository";
import { questionFiltersSchema } from "@/lib/validation";
import { param, type SearchParams } from "@/lib/page-data";
import { QUESTION_TYPES } from "@/lib/types";
import { QuestionMeta } from "@/components/QuestionContent";
import Notice from "@/components/Notice";

export const metadata = { title: "Bank soal" };

export default async function QuestionList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = Object.fromEntries(["search", "grade", "subject", "type", "example"].flatMap((key) => {const value = param(params[key]); return value ? [[key, value]] : [];}));
  const parsed = questionFiltersSchema.safeParse(filters);
  const [questions, subjects] = await Promise.all([
    parsed.success ? listQuestions(parsed.data) : Promise.resolve([]),
    db.question.findMany({ select: { subject: true }, distinct: ["subject"], orderBy: { subject: "asc" } }),
  ]);
  return <div className="stack page-stack">
    <div className="page-heading"><div><p className="eyebrow">KOLEKSI PEMBELAJARAN</p><h1>Bank soal</h1><p className="lead">Temukan soal yang tepat untuk kelas Anda.</p></div><Link className="btn btn-primary" href="/soal/baru"><Plus size={18} /> Buat soal baru</Link></div>
    <Notice message={param(params.pesan)} />
    <form className="panel filter-panel" action="/soal" method="get">
      <div className="field search-field"><label className="label" htmlFor="search">Cari soal</label><div className="search-wrap"><Search size={18} aria-hidden="true" /><input className="input" id="search" name="search" defaultValue={filters.search} maxLength={200} placeholder="Teks soal, topik, atau pelajaran…" /></div></div>
      <div className="field"><label className="label" htmlFor="grade">Kelas</label><select className="select" id="grade" name="grade" defaultValue={filters.grade || ""}><option value="">Semua kelas</option>{[1,2,3,4,5,6].map((grade) => <option key={grade} value={grade}>Kelas {grade}</option>)}</select></div>
      <div className="field"><label className="label" htmlFor="subject">Mata pelajaran</label><select className="select" id="subject" name="subject" defaultValue={filters.subject || ""}><option value="">Semua pelajaran</option>{subjects.map(({ subject }) => <option key={subject}>{subject}</option>)}</select></div>
      <div className="field"><label className="label" htmlFor="type">Jenis soal</label><select className="select" id="type" name="type" defaultValue={filters.type || ""}><option value="">Semua jenis</option>{Object.entries(QUESTION_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="field"><label className="label" htmlFor="example">Sumber soal</label><select className="select" id="example" name="example" defaultValue={filters.example || ""}><option value="">Semua soal</option><option value="true">Soal contoh</option><option value="false">Soal buatan guru</option></select></div>
      <div className="filter-actions"><button className="btn btn-primary" type="submit">Terapkan</button><Link className="text-link" href="/soal">Reset</Link></div>
    </form>
    {!parsed.success && <p role="alert" className="alert alert-error">Filter tidak valid. Pilih filter yang tersedia atau tekan Reset.</p>}
    <div className="section-heading"><h2>{questions.length} soal ditemukan</h2><Link href="/lembar/baru" className="text-link">Susun menjadi lembar soal <ArrowRight size={16} /></Link></div>
    {questions.length ? <div className="question-list">{questions.map((question) => <article className="question-row" key={question.id}><div><QuestionMeta question={question} /><h3><Link href={`/soal/${question.id}`}>{question.text}</Link></h3>{question.topic && <p className="muted text-sm mt-2">Topik: {question.topic}</p>}</div><Link href={`/soal/${question.id}`} className="btn btn-secondary shrink-0" aria-label={`Lihat soal: ${question.text.slice(0, 80)}`}>Lihat <ArrowRight size={16} /></Link></article>)}</div> : <div className="empty-state"><BookEmpty /><h2>Belum ada soal yang cocok</h2><p>Ubah kata pencarian atau reset filter. Anda juga bisa membuat soal baru.</p><div className="row justify-center"><Link className="btn btn-secondary" href="/soal">Reset filter</Link><Link className="btn btn-primary" href="/soal/baru">Buat soal</Link></div></div>}
  </div>;
}

function BookEmpty() {return <Search size={30} className="mx-auto mb-4 text-forest" aria-hidden="true" />;}
