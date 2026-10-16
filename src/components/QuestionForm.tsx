"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { OPTION_LABELS, QUESTION_TYPES, type Question, type QuestionType } from "@/lib/types";

type FieldErrors = Record<string, string | string[]>;

export default function QuestionForm({ question }: { question?: Question }) {
  const router = useRouter();
  const [grade, setGrade] = useState(question?.grade ?? 1);
  const [subject, setSubject] = useState(question?.subject ?? "");
  const [topic, setTopic] = useState(question?.topic ?? "");
  const [type, setType] = useState<QuestionType>(question?.type ?? "PILIHAN_GANDA");
  const [text, setText] = useState(question?.text ?? "");
  const [options, setOptions] = useState<string[]>(OPTION_LABELS.map((_, index) => question?.options[index] ?? ""));
  const [answer, setAnswer] = useState(question?.answer ?? "");
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) summaryRef.current?.focus();
  }, [error]);

  function fieldError(name: string) {
    const value = fields[name];
    if (!value) return null;
    return <p id={`${name}-error`} className="field-error">{Array.isArray(value) ? value.join(" ") : value}</p>;
  }

  function validationProps(name: string) {
    return { "aria-invalid": Boolean(fields[name]), "aria-describedby": fields[name] ? `${name}-error` : undefined };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    setFields({});
    try {
      const response = await fetch(question ? `/api/soal/${question.id}` : "/api/soal", {
        method: question ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject, topic, type, text, options: type === "PILIHAN_GANDA" ? options : [], answer, explanation }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setFields(result?.fields ?? {});
        setError(result?.error ?? "Soal belum dapat disimpan. Periksa isian dan coba lagi.");
        return;
      }
      router.push(`/soal?pesan=${encodeURIComponent(question ? "Perubahan soal berhasil disimpan." : "Soal baru berhasil disimpan.")}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke aplikasi. Pastikan server lokal berjalan, lalu coba lagi. Isian Anda tetap tersimpan di formulir ini.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="stack" aria-busy={pending}>
      {error && <div className="alert alert-error" role="alert" tabIndex={-1} ref={summaryRef}><strong>Periksa kembali soal Anda.</strong><p>{error}</p></div>}
      {question?.isExample && <div className="alert"><span className="badge badge-example">Contoh</span> Soal ini berasal dari seed awal. Anda dapat mengubah atau menghapusnya.</div>}
      <fieldset disabled={pending} className="stack form-fieldset">
        <section className="panel stack" aria-labelledby="question-details-title">
          <div><h2 id="question-details-title">Informasi soal</h2><p className="muted">Tanda * menunjukkan isian wajib.</p></div>
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="grade">Kelas *</label>
              <select id="grade" className="select" value={grade} onChange={(event) => setGrade(Number(event.target.value))} {...validationProps("grade")}>
                {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>Kelas {value}</option>)}
              </select>
              {fieldError("grade")}
            </div>
            <div className="field">
              <label className="label" htmlFor="subject">Mata pelajaran *</label>
              <input id="subject" className="input" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Contoh: Matematika" required maxLength={80} {...validationProps("subject")} />
              {fieldError("subject")}
            </div>
            <div className="field">
              <label className="label" htmlFor="topic">Topik <span className="muted">(opsional)</span></label>
              <input id="topic" className="input" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Contoh: Penjumlahan" maxLength={120} {...validationProps("topic")} />
              {fieldError("topic")}
            </div>
            <div className="field">
              <label className="label" htmlFor="type">Jenis soal *</label>
              <select id="type" className="select" value={type} onChange={(event) => { setType(event.target.value as QuestionType); setAnswer(""); }} {...validationProps("type")}>
                {Object.entries(QUESTION_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              {fieldError("type")}
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="text">Teks soal *</label>
            <textarea id="text" className="textarea" rows={5} value={text} onChange={(event) => setText(event.target.value)} placeholder="Tuliskan pertanyaan dengan bahasa yang mudah dipahami siswa…" required maxLength={5000} {...validationProps("text")} />
            {fieldError("text")}
          </div>
        </section>
        <section className="panel stack" aria-labelledby="question-answer-title">
          <div><h2 id="question-answer-title">Jawaban & pembahasan</h2><p className="muted">Kunci jawaban hanya ditampilkan pada halaman guru dan cetakan kunci jawaban.</p></div>
          {type === "PILIHAN_GANDA" && <fieldset className="stack form-fieldset"><legend className="label">Pilihan jawaban *</legend><p className="muted">Isi keempat pilihan A–D dengan jawaban yang berbeda.</p><div className="form-grid">
            {OPTION_LABELS.map((label, index) => <div className="field" key={label}>
              <label className="label" htmlFor={`option-${label}`}>Pilihan {label} *</label>
              <input id={`option-${label}`} className="input" value={options[index]} onChange={(event) => setOptions(options.map((value, optionIndex) => optionIndex === index ? event.target.value : value))} required maxLength={1000} aria-invalid={Boolean(fields.options || fields[`options.${index}`])} aria-describedby={fields.options ? "options-error" : fields[`options.${index}`] ? `options.${index}-error` : undefined} />
              {fieldError(`options.${index}`)}
            </div>)}
          </div>{fieldError("options")}</fieldset>}
          <div className="field">
            <label className="label" htmlFor="answer">{type === "URAIAN" ? "Contoh jawaban / pedoman penilaian" : "Kunci jawaban"} *</label>
            {type === "PILIHAN_GANDA" ? <select id="answer" className="select" value={answer} onChange={(event) => setAnswer(event.target.value)} required {...validationProps("answer")}>
              <option value="">Pilih jawaban yang benar</option>
              {OPTION_LABELS.map((label) => <option key={label} value={label}>Pilihan {label}</option>)}
            </select> : <textarea id="answer" className="textarea" rows={type === "URAIAN" ? 4 : 2} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={type === "URAIAN" ? "Tuliskan unsur jawaban yang diharapkan…" : "Tuliskan jawaban yang benar…"} required maxLength={5000} {...validationProps("answer")} />}
            {fieldError("answer")}
          </div>
          <div className="field">
            <label className="label" htmlFor="explanation">Pembahasan <span className="muted">(opsional)</span></label>
            <textarea id="explanation" className="textarea" rows={4} value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Jelaskan cara mendapatkan jawaban…" maxLength={5000} {...validationProps("explanation")} />
            {fieldError("explanation")}
          </div>
        </section>
      </fieldset>
      <div className="form-actions"><Link className="btn btn-secondary" href={question ? `/soal/${question.id}` : "/soal"}>Batal</Link><button className="btn btn-primary" type="submit" disabled={pending}><Save size={18} aria-hidden="true" />{pending ? "Menyimpan…" : "Simpan soal"}</button></div>
    </form>
  );
}
