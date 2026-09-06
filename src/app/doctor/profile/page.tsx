import Link from "next/link";

export default function DoctorProfilePlaceholder() {
  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 sm:px-8"><section className="mx-auto max-w-3xl rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm"><p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My Profile</h1><p className="mt-3 text-[var(--muted)]">Profile editing and appointment availability will be added in the next step.</p><Link className="mt-6 inline-block font-semibold text-[var(--brand)] hover:underline" href="/doctor/dashboard">Back to dashboard</Link></section></main>;
}
