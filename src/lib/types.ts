export type QuestionType = "PILIHAN_GANDA" | "ISIAN_SINGKAT" | "URAIAN";
export const QUESTION_TYPES: Record<QuestionType, string> = {
  PILIHAN_GANDA: "Pilihan ganda",
  ISIAN_SINGKAT: "Isian singkat",
  URAIAN: "Uraian",
};
export const OPTION_LABELS = ["A", "B", "C", "D"] as const;
export interface QuestionInput {
  grade: number;
  subject: string;
  topic?: string;
  type: QuestionType;
  text: string;
  options: string[];
  answer: string;
  explanation?: string;
}
export interface Question {
  id: string;
  grade: number;
  subject: string;
  topic: string | null;
  type: QuestionType;
  text: string;
  options: string[];
  answer: string;
  explanation: string | null;
  isExample: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface WorksheetItem {
  id: string;
  questionId: string | null;
  position: number;
  question: Question;
}
export interface Worksheet {
  id: string;
  title: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  items: WorksheetItem[];
}
export interface WorksheetInput {
  title: string;
  instructions: string;
  items: { questionId?: string; itemId?: string }[];
}
