import { Prisma, type Question as DbQuestion, type Worksheet as DbWorksheet, type WorksheetItem as DbWorksheetItem } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/http";
import type { Question, QuestionType, Worksheet } from "@/lib/types";
import type { QuestionFilters, ValidQuestionInput, ValidWorksheetInput } from "@/lib/validation";

export function serializeQuestion(row: DbQuestion): Question {
  return {
    ...row,
    type: row.type as QuestionType,
    options: JSON.parse(row.options) as string[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type WorksheetWithItems = DbWorksheet & { items: DbWorksheetItem[] };

export function serializeWorksheet(row: WorksheetWithItems): Worksheet {
  return {
    id: row.id,
    title: row.title,
    instructions: row.instructions,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map((item) => ({
      id: item.id,
      questionId: item.questionId,
      position: item.position,
      question: JSON.parse(item.snapshot) as Question,
    })),
  };
}

function questionData(input: ValidQuestionInput) {
  return {
    grade: input.grade,
    subject: input.subject,
    topic: input.topic || null,
    type: input.type,
    text: input.text,
    options: JSON.stringify(input.options),
    answer: input.answer,
    explanation: input.explanation || null,
  };
}

export async function listQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
  const where: Prisma.QuestionWhereInput = {
    grade: filters.grade,
    subject: filters.subject || undefined,
    type: filters.type,
    isExample: filters.example === undefined ? undefined : filters.example === "true",
  };
  if (filters.search) {
    where.OR = ["text", "subject", "topic"].map((key) => ({ [key]: { contains: filters.search, mode: "insensitive" } }));
  }
  return (await db.question.findMany({ where, orderBy: [{ updatedAt: "desc" }, { id: "asc" }] })).map(serializeQuestion);
}

export async function getQuestion(id: string): Promise<Question> {
  const row = await db.question.findUnique({ where: { id } });
  if (!row) throw new AppError(404, "Soal tidak ditemukan. Soal mungkin sudah dihapus.");
  return serializeQuestion(row);
}

export async function createQuestion(input: ValidQuestionInput): Promise<Question> {
  return serializeQuestion(await db.question.create({ data: questionData(input) }));
}

export async function updateQuestion(id: string, input: ValidQuestionInput): Promise<Question> {
  return serializeQuestion(await db.question.update({ where: { id }, data: questionData(input) }));
}

export async function deleteQuestion(id: string): Promise<void> {
  await db.question.delete({ where: { id } });
}

const worksheetInclude = { items: { orderBy: { position: "asc" as const } } };

export async function listWorksheets(): Promise<Worksheet[]> {
  return (await db.worksheet.findMany({ include: worksheetInclude, orderBy: [{ updatedAt: "desc" }, { id: "asc" }] })).map(serializeWorksheet);
}

export async function getWorksheet(id: string): Promise<Worksheet> {
  const row = await db.worksheet.findUnique({ where: { id }, include: worksheetInclude });
  if (!row) throw new AppError(404, "Lembar soal tidak ditemukan. Lembar mungkin sudah dihapus.");
  return serializeWorksheet(row);
}

async function resolveItems(tx: Prisma.TransactionClient, input: ValidWorksheetInput, existing: DbWorksheetItem[]) {
  const ids = input.items.flatMap((item) => item.questionId ? [item.questionId] : []);
  const rows = ids.length ? await tx.question.findMany({ where: { id: { in: ids } } }) : [];
  const questions = new Map(rows.map((row) => [row.id, row]));
  const oldItems = new Map(existing.map((item) => [item.id, item]));
  const seen = new Set<string>();
  return input.items.map((item, position) => {
    let questionId: string | null;
    let snapshot: string;
    let sourceId: string;
    let id: string | undefined;
    if (item.itemId) {
      const original = oldItems.get(item.itemId);
      if (!original) throw new AppError(400, "Ada soal yang tidak termasuk dalam lembar ini. Muat ulang halaman, lalu coba lagi.");
      questionId = original.questionId;
      snapshot = original.snapshot;
      sourceId = (JSON.parse(snapshot) as Question).id;
      id = original.id;
    } else {
      const question = questions.get(item.questionId!);
      if (!question) throw new AppError(400, "Ada soal pilihan yang sudah dihapus dari bank soal. Pilih kembali soal yang tersedia.");
      questionId = question.id;
      snapshot = JSON.stringify(serializeQuestion(question));
      sourceId = question.id;
    }
    if (seen.has(sourceId)) throw new AppError(400, "Soal yang sama tidak boleh dipilih lebih dari sekali dalam satu lembar.");
    seen.add(sourceId);
    return { id, questionId, position, snapshot };
  });
}

export async function createWorksheet(input: ValidWorksheetInput): Promise<Worksheet> {
  return db.$transaction(async (tx) => {
    const items = await resolveItems(tx, input, []);
    const row = await tx.worksheet.create({
      data: { title: input.title, instructions: input.instructions, items: { create: items } },
      include: worksheetInclude,
    });
    return serializeWorksheet(row);
  });
}

export async function updateWorksheet(id: string, input: ValidWorksheetInput): Promise<Worksheet> {
  return db.$transaction(async (tx) => {
    const original = await tx.worksheet.findUnique({ where: { id }, include: worksheetInclude });
    if (!original) throw new AppError(404, "Lembar soal tidak ditemukan. Lembar mungkin sudah dihapus.");
    const items = await resolveItems(tx, input, original.items);
    await tx.worksheetItem.deleteMany({ where: { worksheetId: id } });
    const row = await tx.worksheet.update({
      where: { id },
      data: { title: input.title, instructions: input.instructions, items: { create: items } },
      include: worksheetInclude,
    });
    return serializeWorksheet(row);
  });
}

export async function deleteWorksheet(id: string): Promise<void> {
  await db.worksheet.delete({ where: { id } });
}
