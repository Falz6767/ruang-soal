import Link from "next/link";
import { getWorksheet } from "@/lib/repository";
import { pageData, param, type SearchParams } from "@/lib/page-data";
import { OPTION_LABELS } from "@/lib/types";
import QuestionContent from "@/components/QuestionContent";
import PrintButton from "@/components/PrintButton";
import Notice from "@/components/Notice";
export const metadata = { title: "Pratinjau dan cetak" };
export default async function Preview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  const { id } = await params;
  const [worksheet, query] = await Promise.all([pageData(() => getWorksheet(id)), searchParams]);
  const answerMode = param(query.kunci) === "1";
  return <div className="stack preview-layout"><div className="no-print stack"><div className="page-heading"><div><Link href="/lembar" className="text-link">← Kembali ke lembar soal</Link><h1 className="mt-3">{answerMode ? "Kunci jawaban" : "Pratinjau lembar soal"}</h1></div><div className="row"><Link href={`/lembar/${id}/ubah`} className="btn btn-secondary">Ubah lembar</Link><PrintButton label={answerMode ? "Cetak kunci jawaban" : "Cetak lembar soal"} /></div></div><Notice message={param(query.pesan)} /><div className="preview-toolbar"><div className="row" aria-label="Pilih tampilan cetak"><Link className={`btn ${answerMode ? "btn-secondary" : "btn-primary"}`} aria-current={!answerMode ? "page" : undefined} href={`/lembar/${id}/pratinjau`}>Lembar soal</Link><Link className={`btn ${answerMode ? "btn-primary" : "btn-secondary"}`} aria-current={answerMode ? "page" : undefined} href={`/lembar/${id}/pratinjau?kunci=1`}>Kunci jawaban terpisah</Link></div><p className="muted text-sm">Pilih kertas A4. Nonaktifkan header dan footer browser untuk hasil lebih bersih.</p></div></div>
    <article className="print-sheet" aria-label={answerMode ? "Dokumen kunci jawaban" : "Dokumen lembar soal"}>
      <header className="sheet-header">{answerMode && <p className="sheet-kicker">PEGANGAN GURU · KUNCI JAWABAN</p>}<h2>{worksheet.title}</h2>{!answerMode && <div className="student-fields"><span>Nama: __________________________</span><span>Kelas: __________</span><span>Tanggal: ______________</span></div>}</header>
      {!answerMode && worksheet.instructions && <section className="sheet-instructions"><h3>Petunjuk pengerjaan</h3><p className="whitespace-pre-wrap">{worksheet.instructions}</p></section>}
      <ol className="sheet-questions">{worksheet.items.map((item, index) => {const q = item.question; return <li className="sheet-question" key={item.id}><span className="question-number">{index + 1}.</span><div>{answerMode ? <><p className="answer-question whitespace-pre-wrap">{q.text}</p><p className="whitespace-pre-wrap"><strong>Jawaban: </strong>{q.answer}{q.type === "PILIHAN_GANDA" ? `. ${q.options[OPTION_LABELS.findIndex((label) => label === q.answer)]}` : ""}</p>{q.explanation && <p className="whitespace-pre-wrap"><strong>Pembahasan: </strong>{q.explanation}</p>}</> : <><QuestionContent question={q} />{q.type === "ISIAN_SINGKAT" && <div className="short-answer-space">Jawaban: __________________________________________________</div>}{q.type === "URAIAN" && <div className="essay-space" aria-label="Ruang jawaban"><i /><i /><i /><i /></div>}</>}</div></li>;})}</ol>
      <footer className="sheet-footer">{worksheet.items.length} soal{answerMode ? " · Kunci jawaban untuk guru" : " · Selamat mengerjakan!"}</footer>
    </article>
  </div>;
}
