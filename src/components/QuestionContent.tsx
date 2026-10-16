import { OPTION_LABELS, QUESTION_TYPES, type Question } from "@/lib/types";

export function QuestionMeta({ question }: { question: Question }) {
  return <div className="question-meta"><span className="badge">Kelas {question.grade}</span><span>{question.subject}</span><span>·</span><span>{QUESTION_TYPES[question.type]}</span>{question.isExample && <span className="badge badge-example">Contoh seed</span>}</div>;
}

export default function QuestionContent({ question, answer = false }: { question: Question; answer?: boolean }) {
  return <div className="question-content">
    <p className="whitespace-pre-wrap">{question.text}</p>
    {question.type === "PILIHAN_GANDA" && <ol className="option-list" aria-label="Pilihan jawaban">{question.options.map((option, index) => <li key={index}><span>{OPTION_LABELS[index]}.</span><span className="whitespace-pre-wrap">{option}</span></li>)}</ol>}
    {answer && <div className="answer-box"><strong>Kunci jawaban</strong><p className="whitespace-pre-wrap">{question.answer}{question.type === "PILIHAN_GANDA" ? `. ${question.options[OPTION_LABELS.findIndex((label) => label === question.answer)]}` : ""}</p>{question.explanation && <><strong>Pembahasan</strong><p className="whitespace-pre-wrap">{question.explanation}</p></>}</div>}
  </div>;
}
