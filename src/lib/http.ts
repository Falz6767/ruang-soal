import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    const body = await request.text();
    if (body.length > 1_500_000) throw new AppError(413, "Data terlalu besar. Kurangi panjang isian atau jumlah soal.");
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "Data yang dikirim bukan JSON yang valid.");
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      fields[key] ??= issue.message;
    }
    return NextResponse.json({ error: "Periksa kembali isian yang ditandai.", fields }, { status: 400 });
  }
  if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return NextResponse.json({ error: "Data tidak ditemukan. Data mungkin sudah dihapus." }, { status: 404 });
  }
  console.error("Gagal memproses permintaan:", error);
  return NextResponse.json({ error: "Data belum dapat diproses. Pastikan database tersedia, lalu coba lagi." }, { status: 500 });
}
