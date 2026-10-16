import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/http";
import { createWorksheet, listWorksheets } from "@/lib/repository";
import { worksheetInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: await listWorksheets() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = worksheetInputSchema.parse(await readJson(request));
    return NextResponse.json({ data: await createWorksheet(input) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
