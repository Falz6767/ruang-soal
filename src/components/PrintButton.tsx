"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Cetak / simpan PDF" }: { label?: string }) {
  return <button type="button" className="btn btn-primary" onClick={() => window.print()}><Printer size={18} aria-hidden="true" />{label}</button>;
}
