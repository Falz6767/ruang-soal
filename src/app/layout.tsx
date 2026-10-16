import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ruang Soal — Bank Soal SD", template: "%s | Ruang Soal" },
  description: "Bank soal dan penyusun lembar soal untuk guru Sekolah Dasar.",
};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body><a className="skip-link" href="#konten">Lewati ke konten</a><Navigation /><main id="konten" className="main-shell" tabIndex={-1}>{children}</main><footer className="site-footer no-print"><span>Ruang Soal</span><span>Dibuat untuk membantu guru menyiapkan pembelajaran.</span></footer></body></html>;
}
