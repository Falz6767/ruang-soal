import { z } from "zod";

z.setErrorMap((issue) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    return { message: issue.received === "undefined" ? "Isian ini wajib diisi." : "Format isian ini tidak sesuai." };
  }
  if (issue.code === z.ZodIssueCode.unrecognized_keys) return { message: "Ada kolom yang tidak dikenali dalam data." };
  if (issue.code === z.ZodIssueCode.too_small) return { message: "Isian belum memenuhi jumlah atau panjang minimum." };
  if (issue.code === z.ZodIssueCode.too_big) return { message: "Isian melebihi jumlah atau panjang maksimum." };
  return { message: "Isian tidak valid. Periksa kembali nilai yang dimasukkan." };
});

export const questionTypeSchema = z.enum(["PILIHAN_GANDA", "ISIAN_SINGKAT", "URAIAN"], {
  errorMap: () => ({ message: "Pilih jenis soal yang tersedia." }),
});

const shortOptional = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter.`).optional().default("");

export const questionInputSchema = z.object({
  grade: z.number({ required_error: "Kelas wajib dipilih.", invalid_type_error: "Kelas harus berupa angka." })
    .int("Kelas harus berupa bilangan bulat.").min(1, "Kelas minimal 1.").max(6, "Kelas maksimal 6."),
  subject: z.string({ required_error: "Mata pelajaran wajib diisi." }).trim()
    .min(1, "Mata pelajaran wajib diisi.").max(80, "Mata pelajaran maksimal 80 karakter."),
  topic: shortOptional(120, "Topik"),
  type: questionTypeSchema,
  text: z.string({ required_error: "Teks soal wajib diisi." }).trim()
    .min(1, "Teks soal wajib diisi.").max(5000, "Teks soal maksimal 5.000 karakter."),
  options: z.array(z.string().trim().max(1000, "Pilihan maksimal 1.000 karakter."))
    .max(4, "Sediakan empat pilihan A–D.").default([]),
  answer: z.string({ required_error: "Kunci jawaban wajib diisi." }).trim()
    .min(1, "Kunci jawaban wajib diisi.").max(5000, "Kunci jawaban maksimal 5.000 karakter."),
  explanation: shortOptional(5000, "Pembahasan"),
}).strict().superRefine((input, context) => {
  if (input.type === "PILIHAN_GANDA") {
    if (input.options.length !== 4 || input.options.some((option) => !option)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Pilihan ganda harus memiliki empat pilihan A–D yang terisi." });
    }
    if (new Set(input.options.map((option) => option.toLocaleLowerCase("id-ID"))).size !== input.options.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Setiap pilihan jawaban harus berbeda." });
    }
    if (!["A", "B", "C", "D"].includes(input.answer)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["answer"], message: "Kunci pilihan ganda harus A, B, C, atau D." });
    }
  } else if (input.options.length !== 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Isian singkat dan uraian tidak menggunakan pilihan jawaban." });
  }
});

const worksheetItemInputSchema = z.object({
  questionId: z.string().trim().min(1).max(100).optional(),
  itemId: z.string().trim().min(1).max(100).optional(),
}).strict().refine((item) => Boolean(item.questionId) !== Boolean(item.itemId), {
  message: "Setiap soal harus memiliki satu referensi soal atau referensi item lembar.",
});

export const worksheetInputSchema = z.object({
  title: z.string({ required_error: "Judul wajib diisi." }).trim()
    .min(1, "Judul wajib diisi.").max(160, "Judul maksimal 160 karakter."),
  instructions: z.string().trim().max(3000, "Petunjuk maksimal 3.000 karakter.").default(""),
  items: z.array(worksheetItemInputSchema)
    .min(1, "Pilih setidaknya satu soal untuk lembar ini.")
    .max(100, "Satu lembar dapat berisi maksimal 100 soal."),
}).strict().superRefine((input, context) => {
  const refs = input.items.map((item) => item.itemId ? `item:${item.itemId}` : `question:${item.questionId}`);
  if (new Set(refs).size !== refs.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["items"], message: "Soal yang sama tidak boleh dipilih lebih dari sekali." });
  }
});

export const questionFiltersSchema = z.object({
  search: z.string().trim().max(200, "Pencarian maksimal 200 karakter.").optional(),
  grade: z.coerce.number().int().min(1, "Kelas harus 1–6.").max(6, "Kelas harus 1–6.").optional(),
  subject: z.string().trim().max(80).optional(),
  type: questionTypeSchema.optional(),
  example: z.enum(["true", "false"], { errorMap: () => ({ message: "Filter contoh tidak valid." }) }).optional(),
});

export type ValidQuestionInput = z.infer<typeof questionInputSchema>;
export type ValidWorksheetInput = z.infer<typeof worksheetInputSchema>;
export type QuestionFilters = z.infer<typeof questionFiltersSchema>;
