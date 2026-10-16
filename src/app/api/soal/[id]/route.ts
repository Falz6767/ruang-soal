import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/http";
import { deleteQuestion, getQuestion, updateQuestion } from "@/lib/repository";
import { questionInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    return NextResponse.json({ data: await getQuestion((await context.params).id) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const input = questionInputSchema.parse(await readJson(request));
    return NextResponse.json({ data: await updateQuestion((await context.params).id, input) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    await deleteQuestion((await context.params).id);
    return NextResponse.json({ message: "Soal berhasil dihapus. Salinan pada lembar soal tetap tersedia." });
  } catch (error) {
    return errorResponse(error);
  }
}
