import Link from "next/link";
import WorksheetEditor from "@/components/WorksheetEditor";
import { listQuestions } from "@/lib/repository";
export const metadata = { title: "Susun lembar soal" };
export default async function NewWorksheet() {
  const questions = await listQuestions();
  return <div className="stack page-stack"><Link href="/lembar" className="text-link">← Kembali ke lembar soal</Link><div><p className="eyebrow">RANGKAI PEMBELAJARAN</p><h1>Susun lembar soal</h1><p className="lead">Pilih soal dari bank, lalu atur sesuai alur belajar Anda.</p></div><WorksheetEditor questions={questions} /></div>;
}
