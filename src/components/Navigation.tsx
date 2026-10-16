"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Files, Sprout } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/soal", label: "Bank soal", Icon: BookOpen },
  { href: "/lembar", label: "Lembar soal", Icon: Files },
];

export default function Navigation() {
  const pathname = usePathname();
  return <header className="site-header no-print">
    <div className="header-inner">
      <Link href="/" className="brand" aria-label="Ruang Soal, beranda"><span className="brand-mark"><Sprout size={25} /></span><span>Ruang Soal<small>Ruang kecil, ide besar.</small></span></Link>
      <nav aria-label="Navigasi utama">{links.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return <Link key={href} href={href} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined}><Icon size={18} /><span>{label}</span></Link>;
      })}</nav>
      <span className="local-label"><span /> Ruang kerja guru</span>
    </div>
  </header>;
}
