import Link from "next/link";
import WorksheetEditor from "@/components/WorksheetEditor";
import { getWorksheet, listQuestions } from "@/lib/repository";
import { pageData } from "@/lib/page-data";
export const metadata = { title: "Ubah lembar soal" };
export default async function EditWorksheet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [worksheet, questions] = await Promise.all([pageData(() => getWorksheet(id)), listQuestions()]);
  return <div className="stack page-stack"><Link href={`/lembar/${id}/pratinjau`} className="text-link">← Kembali ke pratinjau</Link><div><p className="eyebrow">SESUAIKAN LATIHAN</p><h1>Ubah lembar soal</h1><p className="lead">Atur urutan dan pilihan soal sebelum dicetak.</p></div><WorksheetEditor questions={questions} worksheet={worksheet} /></div>;
}
