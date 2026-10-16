"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Save, Search, X } from "lucide-react";
import { QUESTION_TYPES, type Question, type QuestionType, type Worksheet } from "@/lib/types";

type SelectedQuestion = { key: string; itemId?: string; questionId: string | null; question: Question };
type FieldErrors = Record<string, string | string[]>;

export default function WorksheetEditor({ questions, worksheet }: { questions: Question[]; worksheet?: Worksheet }) {
  const router = useRouter();
  const [title, setTitle] = useState(worksheet?.title ?? "");
  const [instructions, setInstructions] = useState(worksheet?.instructions ?? "Kerjakan soal berikut dengan teliti. Dahulukan soal yang kamu anggap mudah.");
  const [selected, setSelected] = useState<SelectedQuestion[]>(() => (worksheet?.items ?? []).map((item) => ({ key: item.id, itemId: item.id, questionId: item.questionId, question: item.question })));
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<QuestionType | "">("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const [announcement, setAnnouncement] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const subjects = useMemo(() => [...new Set(questions.map((question) => question.subject))].sort((a, b) => a.localeCompare(b, "id")), [questions]);
  const selectedIds = useMemo(() => new Set(selected.map((item) => item.questionId).filter(Boolean)), [selected]);
  const filteredQuestions = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("id");
    return questions.filter((question) => (!grade || question.grade === Number(grade)) && (!subject || question.subject === subject) && (!type || question.type === type) && (!search || `${question.text} ${question.subject} ${question.topic ?? ""}`.toLocaleLowerCase("id").includes(search)));
  }, [questions, query, grade, subject, type]);

  useEffect(() => {
    if (error) summaryRef.current?.focus();
  }, [error]);

  function fieldError(name: string) {
    const value = fields[name];
    return value ? <p className="field-error" id={`${name}-error`}>{Array.isArray(value) ? value.join(" ") : value}</p> : null;
  }

  function addQuestion(question: Question) {
    if (selectedIds.has(question.id)) return;
    const existingItem = worksheet?.items.find((item) => item.questionId === question.id);
    setSelected((items) => [...items, existingItem
      ? { key: existingItem.id, itemId: existingItem.id, questionId: existingItem.questionId, question: existingItem.question }
      : { key: `new-${question.id}`, questionId: question.id, question }]);
    setAnnouncement("Soal ditambahkan ke lembar soal.");
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= selected.length) return;
    setSelected((items) => {
      const next = [...items];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
    setAnnouncement(`Soal dipindahkan dari urutan ${index + 1} ke ${destination + 1}.`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setFields({});
    if (selected.length === 0) {
      setError("Pilih setidaknya satu soal dari bank soal sebelum menyimpan.");
      setFields({ items: "Lembar soal harus memuat setidaknya satu soal." });
      return;
    }
    setPending(true);
    try {
      const response = await fetch(worksheet ? `/api/lembar/${worksheet.id}` : "/api/lembar", {
        method: worksheet ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, instructions, items: selected.map((item) => item.itemId ? { itemId: item.itemId } : { questionId: item.questionId }) }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setFields(result?.fields ?? {});
        setError(result?.error ?? "Lembar soal belum dapat disimpan. Periksa isian dan coba lagi.");
        return;
      }
      const id = result?.data?.id;
      if (!id) throw new Error("Respons tidak lengkap");
      router.push(`/lembar/${id}/pratinjau?pesan=${encodeURIComponent("Lembar soal berhasil disimpan.")}`);
      router.refresh();
    } catch {
      setError("Tidak dapat menyimpan lembar soal. Pastikan server lokal berjalan, lalu coba lagi. Susunan Anda tetap ada di halaman ini.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit} aria-busy={pending}>
      {error && <div className="alert alert-error" ref={summaryRef} tabIndex={-1} role="alert"><strong>Periksa kembali lembar soal Anda.</strong><p>{error}</p></div>}
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
      <fieldset disabled={pending} className="form-fieldset stack">
        <section className="panel stack" aria-labelledby="worksheet-details-title">
          <div><h2 id="worksheet-details-title">Informasi lembar soal</h2><p className="muted">Tulis judul dan petunjuk yang akan dilihat siswa.</p></div>
          <div className="field"><label htmlFor="title" className="label">Judul lembar soal *</label><input id="title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Latihan Matematika — Kelas 3" required maxLength={160} aria-invalid={Boolean(fields.title)} aria-describedby={fields.title ? "title-error" : undefined} />{fieldError("title")}</div>
          <div className="field"><label htmlFor="instructions" className="label">Petunjuk pengerjaan <span className="muted">(opsional)</span></label><textarea id="instructions" className="textarea" rows={3} value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={3000} aria-invalid={Boolean(fields.instructions)} aria-describedby={fields.instructions ? "instructions-error" : undefined} />{fieldError("instructions")}</div>
        </section>
        <div className="worksheet-editor-grid">
          <section className="panel stack" aria-labelledby="question-bank-title">
            <div><div className="row"><h2 id="question-bank-title">Pilih dari bank soal</h2><span className="badge">{questions.length} soal</span></div><p className="muted">Tambahkan soal yang ingin digunakan dalam lembar ini.</p></div>
            <div className="field"><label htmlFor="bank-search" className="label">Cari soal</label><div className="search-input"><Search size={18} aria-hidden="true" /><input id="bank-search" type="search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Teks soal, topik, atau pelajaran…" /></div></div>
            <div className="form-grid bank-filters">
              <div className="field"><label htmlFor="bank-grade" className="label">Kelas</label><select id="bank-grade" className="select" value={grade} onChange={(event) => setGrade(event.target.value)}><option value="">Semua kelas</option>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>Kelas {value}</option>)}</select></div>
              <div className="field"><label htmlFor="bank-subject" className="label">Mata pelajaran</label><select id="bank-subject" className="select" value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">Semua pelajaran</option>{subjects.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
              <div className="field"><label htmlFor="bank-type" className="label">Jenis soal</label><select id="bank-type" className="select" value={type} onChange={(event) => setType(event.target.value as QuestionType | "")}><option value="">Semua jenis</option>{Object.entries(QUESTION_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            </div>
            <p className="muted" role="status">{filteredQuestions.length} soal ditemukan</p>
            <div className="bank-question-list stack">
              {filteredQuestions.map((question) => {
                const isSelected = selectedIds.has(question.id);
                return <article key={question.id} className={`bank-question${isSelected ? " is-selected" : ""}`}><div className="row"><span className="badge">Kelas {question.grade}</span><span className="muted">{question.subject} · {QUESTION_TYPES[question.type]}</span>{question.isExample && <span className="badge badge-example">Contoh</span>}</div><p className="question-text">{question.text}</p>{question.topic && <p className="muted">Topik: {question.topic}</p>}<button type="button" className={`btn ${isSelected ? "btn-secondary" : "btn-primary"}`} disabled={isSelected} onClick={() => addQuestion(question)} aria-label={isSelected ? `Sudah dipilih: ${question.text}` : `Tambahkan soal: ${question.text}`}>{isSelected ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{isSelected ? "Sudah dipilih" : "Tambahkan"}</button></article>;
              })}
              {filteredQuestions.length === 0 && <div className="empty-state"><h3>{questions.length ? "Belum ada soal yang cocok" : "Bank soal masih kosong"}</h3><p>{questions.length ? "Coba kata pencarian lain atau hapus filter." : "Buat soal terlebih dahulu, lalu kembali untuk menyusun lembar soal."}</p>{questions.length ? <button type="button" className="btn btn-secondary" onClick={() => { setQuery(""); setGrade(""); setSubject(""); setType(""); }}>Hapus filter</button> : <Link className="btn btn-primary" href="/soal/baru">Buat soal</Link>}</div>}
            </div>
          </section>
          <section className="panel stack worksheet-selection" aria-labelledby="selected-questions-title">
            <div><div className="row"><h2 id="selected-questions-title">Susunan soal</h2><span className="badge">{selected.length} dipilih</span></div><p className="muted">Gunakan panah untuk mengubah urutan. Mengeluarkan soal di sini tidak menghapusnya dari bank soal.</p></div>
            {fieldError("items")}
            {selected.length === 0 ? <div className="empty-state"><div className="empty-state-number" aria-hidden="true">1, 2, 3…</div><h3>Mulai susun lembar Anda</h3><p>Pilih tombol Tambahkan pada soal di bank soal. Soal terpilih akan tampil di sini.</p></div> : <ol className="selected-question-list stack">{selected.map((item, index) => <li key={item.key} className="selected-question"><div className="selected-question-heading"><span className="question-number">{index + 1}</span><span className="muted">{QUESTION_TYPES[item.question.type]}</span><div className="row question-order-actions"><button type="button" className="btn btn-icon btn-secondary" disabled={index === 0} onClick={() => moveQuestion(index, -1)} aria-label={`Pindahkan soal nomor ${index + 1} ke atas`} title="Pindahkan ke atas"><ArrowUp size={16} aria-hidden="true" /></button><button type="button" className="btn btn-icon btn-secondary" disabled={index === selected.length - 1} onClick={() => moveQuestion(index, 1)} aria-label={`Pindahkan soal nomor ${index + 1} ke bawah`} title="Pindahkan ke bawah"><ArrowDown size={16} aria-hidden="true" /></button><button type="button" className="btn btn-icon btn-danger" onClick={() => { setSelected((items) => items.filter((value) => value.key !== item.key)); setAnnouncement(`Soal nomor ${index + 1} dikeluarkan dari lembar soal.`); }} aria-label={`Keluarkan soal nomor ${index + 1} dari lembar`} title="Keluarkan dari lembar"><X size={16} aria-hidden="true" /></button></div></div><p className="question-text">{item.question.text}</p><p className="muted">Kelas {item.question.grade} · {item.question.subject}{item.itemId && " · Salinan tersimpan"}</p>{!item.questionId && <p className="muted">Soal asal sudah dihapus; salinan ini tetap dapat dicetak.</p>}</li>)}</ol>}
            {worksheet && <p className="muted">Soal yang sudah disimpan menggunakan salinan isi saat ditambahkan, sehingga lembar tetap konsisten jika bank soal berubah.</p>}
          </section>
        </div>
      </fieldset>
      <div className="form-actions"><Link className="btn btn-secondary" href={worksheet ? `/lembar/${worksheet.id}/pratinjau` : "/lembar"}>Batal</Link><span className="muted">{selected.length} soal dipilih</span><button type="submit" className="btn btn-primary" disabled={pending}><Save size={18} aria-hidden="true" />{pending ? "Menyimpan…" : "Simpan & pratinjau"}</button></div>
    </form>
  );
}
