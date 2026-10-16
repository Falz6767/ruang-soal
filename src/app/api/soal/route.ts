import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/http";
import { createQuestion, listQuestions } from "@/lib/repository";
import { questionFiltersSchema, questionInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const values = Object.fromEntries([...url.searchParams.entries()].filter(([, value]) => value !== ""));
    return NextResponse.json({ data: await listQuestions(questionFiltersSchema.parse(values)) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = questionInputSchema.parse(await readJson(request));
    return NextResponse.json({ data: await createQuestion(input) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
