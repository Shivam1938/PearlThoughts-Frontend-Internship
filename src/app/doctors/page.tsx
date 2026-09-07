import DoctorList from "@/features/doctors/components/DoctorList";

export default function DoctorsPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-2xl border border-[var(--line)] bg-white px-5 py-7 shadow-sm sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Find care</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Book with the right specialist</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">Browse trusted doctors, compare specialties, and find a care professional near you.</p>
        </header>
        <DoctorList />
      </div>
    </main>
  );
}
