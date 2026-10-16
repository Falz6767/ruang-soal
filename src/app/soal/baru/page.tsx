import Link from "next/link";
import QuestionForm from "@/components/QuestionForm";
export const metadata = { title: "Buat soal" };
export default function NewQuestion() {
  return <div className="stack page-stack"><Link href="/soal" className="text-link">← Kembali ke bank soal</Link><div><p className="eyebrow">TAMBAH KOLEKSI</p><h1>Buat soal baru</h1><p className="lead">Satu ide sederhana bisa membuka banyak pemahaman.</p></div><QuestionForm /></div>;
}
