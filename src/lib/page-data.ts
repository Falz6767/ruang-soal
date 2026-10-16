import { notFound } from "next/navigation";
import { AppError } from "@/lib/http";

export async function pageData<T>(query: () => Promise<T>): Promise<T> {
  try { return await query(); }
  catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}
