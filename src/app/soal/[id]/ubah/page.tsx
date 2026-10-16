import Link from "next/link";
import QuestionForm from "@/components/QuestionForm";
import { getQuestion } from "@/lib/repository";
import { pageData } from "@/lib/page-data";
export const metadata = { title: "Ubah soal" };
export default async function EditQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await pageData(() => getQuestion(id));
  return <div className="stack page-stack"><Link href={`/soal/${id}`} className="text-link">← Kembali ke detail soal</Link><div><p className="eyebrow">RAWAT KOLEKSI</p><h1>Ubah soal</h1><p className="lead">Perubahan berlaku di bank soal. Lembar tersimpan tetap memakai salinan sebelumnya.</p></div><QuestionForm question={question} /></div>;
}
