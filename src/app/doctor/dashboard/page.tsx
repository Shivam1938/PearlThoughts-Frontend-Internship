import DoctorLogoutButton from "@/features/doctor/components/DoctorLogoutButton";

export default function DoctorDashboardPlaceholder() {
  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 sm:px-8"><section className="mx-auto max-w-3xl rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1></div><DoctorLogoutButton /></div><p className="mt-5 text-[var(--muted)]">Your appointment overview will be available here in the next step.</p></section></main>;
}
