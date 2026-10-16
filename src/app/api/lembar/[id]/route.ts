import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/http";
import { deleteWorksheet, getWorksheet, updateWorksheet } from "@/lib/repository";
import { worksheetInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    return NextResponse.json({ data: await getWorksheet((await context.params).id) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const input = worksheetInputSchema.parse(await readJson(request));
    return NextResponse.json({ data: await updateWorksheet((await context.params).id, input) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    await deleteWorksheet((await context.params).id);
    return NextResponse.json({ message: "Lembar berhasil dihapus. Soal di bank soal tetap tersimpan." });
  } catch (error) {
    return errorResponse(error);
  }
}
