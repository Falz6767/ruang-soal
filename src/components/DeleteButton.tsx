"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ url, redirectTo, label = "Hapus", confirmMessage }: { url: string; redirectTo: string; label?: string; confirmMessage: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();

  async function remove() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? "Data belum dapat dihapus. Silakan coba lagi.");
        return;
      }
      dialogRef.current?.close();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server lokal. Coba lagi setelah server berjalan.");
    } finally {
      setPending(false);
    }
  }

  return <div className="delete-action">
    <button type="button" className="btn btn-danger" onClick={() => { setError(""); dialogRef.current?.showModal(); }} disabled={pending}><Trash2 size={17} aria-hidden="true" />{label}</button>
    <dialog className="confirm-dialog" ref={dialogRef} aria-labelledby={`${dialogId}-title`} aria-describedby={`${dialogId}-description`} onCancel={(event) => { if (pending) event.preventDefault(); }}>
      <div className="stack"><h2 id={`${dialogId}-title`}>Konfirmasi penghapusan</h2><p id={`${dialogId}-description`}>{confirmMessage}</p>{error && <p className="alert alert-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="btn btn-secondary" autoFocus disabled={pending} onClick={() => dialogRef.current?.close()}>Batal</button><button type="button" className="btn btn-danger" disabled={pending} onClick={remove}>{pending ? "Menghapus…" : "Ya, hapus"}</button></div></div>
    </dialog>
  </div>;
}
