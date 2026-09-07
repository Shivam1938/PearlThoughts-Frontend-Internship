"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/auth-context";
import { getPrescription } from "@/features/appointments/api/getPrescription";
import type { Prescription } from "@/types/prescription";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function PrescriptionPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user, isReady } = useAuth();
  const [prescription, setPrescription] = useState<Prescription | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getPrescription(params.id)
      .then((data) => { if (active) setPrescription(data); })
      .catch(() => { if (active) setError("Unable to load this prescription."); });
    return () => { active = false; };
  }, [params.id]);

  useEffect(() => {
    if (prescription && searchParams.get("download") === "1") {
      const timer = window.setTimeout(() => window.print(), 200);
      return () => window.clearTimeout(timer);
    }
  }, [prescription, searchParams]);

  if (!isReady || prescription === undefined) return <main className="min-h-screen bg-[var(--canvas)] px-4 py-10"><p className="mx-auto max-w-3xl text-sm text-[var(--muted)]">Loading prescription…</p></main>;
  if (error) return <main className="min-h-screen bg-[var(--canvas)] px-4 py-10"><p className="mx-auto max-w-3xl text-sm text-rose-700" role="alert">{error}</p></main>;
  if (!prescription || prescription.patientId !== user?.id) return <main className="min-h-screen bg-[var(--canvas)] px-4 py-10"><div className="mx-auto max-w-3xl rounded-xl border border-[var(--line)] bg-white p-8 text-center"><p className="font-semibold">Prescription not found</p><p className="mt-1 text-sm text-[var(--muted)]">It may not exist, or it doesn&apos;t belong to your account.</p><Link className="mt-5 inline-block font-semibold text-[var(--brand)] hover:underline" href="/">Back to dashboard</Link></div></main>;

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 sm:px-8 print:bg-white print:p-0">
    <style>{"@media print { .no-print { display: none !important; } }"}</style>
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-5 flex items-center justify-between"><Link className="font-semibold text-[var(--brand)] hover:underline" href="/">Back to dashboard</Link><button type="button" onClick={() => window.print()} className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]">Download as PDF</button></div>

      <article className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[var(--brand)]">PulseCare</p><h1 className="mt-1 text-2xl font-semibold">Prescription</h1></div><div className="text-sm text-[var(--muted)] sm:text-right"><p>Issued {formatDate(prescription.createdAt)}</p>{prescription.updatedAt !== prescription.createdAt && <p>Last updated {formatDate(prescription.updatedAt)}</p>}</div></header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Patient</p><p className="mt-1 font-semibold">{prescription.patientName}</p></div><div><p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Prescribing doctor</p><p className="mt-1 font-semibold">{prescription.doctorName}</p></div></section>

        <section className="mt-6"><p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Diagnosis</p><p className="mt-1.5">{prescription.diagnosis}</p></section>

        <section className="mt-6"><p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Medicines</p><div className="mt-2 overflow-hidden rounded-lg border border-[var(--line)]"><table className="w-full text-left text-sm"><thead className="bg-[var(--canvas)]"><tr><th className="px-3 py-2 font-semibold">Medicine</th><th className="px-3 py-2 font-semibold">Dosage</th><th className="px-3 py-2 font-semibold">Frequency</th><th className="px-3 py-2 font-semibold">Duration</th></tr></thead><tbody>{prescription.medicines.map((medicine) => <tr key={medicine.id} className="border-t border-[var(--line)]"><td className="px-3 py-2 font-medium">{medicine.name}</td><td className="px-3 py-2">{medicine.dosage || "—"}</td><td className="px-3 py-2">{medicine.frequency || "—"}</td><td className="px-3 py-2">{medicine.duration || "—"}</td></tr>)}</tbody></table></div></section>

        {prescription.instructions && <section className="mt-6"><p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Instructions</p><p className="mt-1.5 whitespace-pre-line">{prescription.instructions}</p></section>}
      </article>
    </div>
  </main>;
}
