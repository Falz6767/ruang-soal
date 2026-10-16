import Link from "next/link";
import { getQuestion } from "@/lib/repository";
import { pageData } from "@/lib/page-data";
import QuestionContent, { QuestionMeta } from "@/components/QuestionContent";
import DeleteButton from "@/components/DeleteButton";
export const metadata = { title: "Detail soal" };
export default async function QuestionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await pageData(() => getQuestion(id));
  return <div className="stack page-stack narrow"><Link href="/soal" className="text-link">← Kembali ke bank soal</Link><div className="page-heading"><h1>Detail soal</h1><Link href={`/soal/${id}/ubah`} className="btn btn-primary">Ubah soal</Link></div><article className="panel detail-panel"><QuestionMeta question={question} />{question.topic && <p className="muted">Topik: {question.topic}</p>}<QuestionContent question={question} answer /></article><div className="row justify-between"><Link href="/lembar/baru" className="btn btn-secondary">Susun lembar soal</Link><DeleteButton url={`/api/soal/${id}`} redirectTo="/soal?pesan=Soal%20berhasil%20dihapus." confirmMessage="Hapus soal ini dari bank soal? Salinan di lembar soal yang telah disimpan tetap tersedia." label="Hapus soal" /></div></div>;
}
