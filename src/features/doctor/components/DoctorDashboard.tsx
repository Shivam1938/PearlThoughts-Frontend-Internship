"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, ClipboardList, UserRound } from "lucide-react";
import { useMemo } from "react";
import { loadDoctorAppointments } from "@/features/booking/storage";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";

const statusClasses = { confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200", pending: "bg-amber-50 text-amber-800 ring-amber-200", cancelled: "bg-stone-100 text-stone-600 ring-stone-200" };

export default function DoctorDashboard() {
  const { doctor } = useDoctorAuth();
  const upcomingAppointments = useMemo(() => {
    if (!doctor) return [];
    return loadDoctorAppointments(doctor.id)
      .filter((appointment) => appointment.date >= new Date().toISOString().slice(0, 10) && appointment.status !== "cancelled")
      .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`));
  }, [doctor]);

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-6">
          <div><p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {doctor?.name}</h1><p className="mt-2 text-[var(--muted)]">Here&apos;s what&apos;s coming up in your practice.</p></div>
        </header>

        <section className="mt-7 grid gap-4 sm:grid-cols-2" aria-label="Quick actions">
          <QuickAction href="/doctor/profile" icon={<UserRound className="size-5" aria-hidden="true" />} title="My Profile" description="Update your professional details and availability." />
          <QuickAction href="/doctor/appointments" icon={<ClipboardList className="size-5" aria-hidden="true" />} title="View All Appointments" description="Review every patient appointment in one place." />
        </section>

        <section className="mt-7 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm" aria-labelledby="upcoming-title">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6"><div><p className="text-sm font-medium text-[var(--brand)]">Schedule</p><h2 className="mt-1 text-xl font-semibold" id="upcoming-title">Upcoming appointments</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">{upcomingAppointments.length} upcoming</span></div>
          {upcomingAppointments.length === 0 ? <div className="px-6 py-12 text-center"><CalendarDays className="mx-auto size-8 text-[var(--brand)]" aria-hidden="true" /><p className="mt-4 font-semibold">No upcoming appointments yet</p><p className="mt-1 text-sm text-[var(--muted)]">Appointments booked by patients will appear here.</p></div> : <ul className="divide-y divide-[var(--line)]">{upcomingAppointments.map((appointment) => <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" key={appointment.id}><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full bg-emerald-100 font-semibold text-[var(--brand-deep)]">{initials(appointment.patientName)}</div><div><p className="font-semibold">{appointment.patientName}</p><p className="mt-0.5 text-sm text-[var(--muted)]">{appointment.visitType} · {appointment.patientPhone}</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><p className="text-sm font-medium">{formatDate(appointment.date)} · {appointment.time}</p><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusClasses[appointment.status]}`}>{appointment.status}</span></div></li>)}</ul>}
        </section>
      </div>
    </main>
  );
}

function QuickAction({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) { return <Link className="group rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--brand)] hover:shadow-md" href={href}><div className="flex items-start gap-4"><span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-[var(--brand)]">{icon}</span><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm text-[var(--muted)]">{description}</span></span><ChevronRight className="mt-1 size-5 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" aria-hidden="true" /></div></Link>; }
function initials(name: string): string { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function formatDate(date: string): string { return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }); }
