"use client";

import Link from "next/link";
import { CalendarCheck, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Clock3, ShieldAlert, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";

const statusClasses: Record<AppointmentStatus, string> = { pending: "bg-amber-50 text-amber-800 ring-amber-200", confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200", upcoming: "bg-sky-50 text-sky-800 ring-sky-200", completed: "bg-emerald-50 text-emerald-800 ring-emerald-200", cancelled: "bg-stone-100 text-stone-600 ring-stone-200", missed: "bg-rose-50 text-rose-800 ring-rose-200" };

export default function DoctorDashboard() {
  const { doctor } = useDoctorAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!doctor) return;
    let active = true;
    void fetch(`/api/appointments?doctorId=${encodeURIComponent(doctor.id)}`)
      .then(async (response) => response.ok ? (await response.json() as { data: Appointment[] }).data : [])
      .then((data) => { if (active) setAppointments(data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doctor]);

  const upcomingAppointments = appointments.filter((appointment) => (appointment.status === "confirmed" || appointment.status === "upcoming") && new Date(appointment.dateTime ?? appointment.startsAt).getTime() >= now).sort((left, right) => (left.dateTime ?? left.startsAt).localeCompare(right.dateTime ?? right.startsAt));
  const completed = appointments.filter((appointment) => appointment.status === "completed").length;
  const pending = appointments.filter((appointment) => appointment.status === "pending").length;
  const cancelled = appointments.filter((appointment) => appointment.status === "cancelled").length;

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-6">
          <div><p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {doctor?.name}</h1><p className="mt-2 text-[var(--muted)]">Here&apos;s what&apos;s coming up in your practice.</p></div>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Appointment summary">
          <SummaryCard label="Total booked" value={appointments.length} icon={<CalendarCheck className="size-5" aria-hidden="true" />} tone="bg-sky-50 text-sky-600" />
          <SummaryCard label="Completed" value={completed} icon={<CheckCircle2 className="size-5" aria-hidden="true" />} tone="bg-emerald-50 text-emerald-600" />
          <SummaryCard label="Pending" value={pending} icon={<Clock3 className="size-5" aria-hidden="true" />} tone="bg-amber-50 text-amber-600" />
          <SummaryCard label="Cancelled" value={cancelled} icon={<ShieldAlert className="size-5" aria-hidden="true" />} tone="bg-rose-50 text-rose-600" />
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2" aria-label="Quick actions">
          <QuickAction href="/doctor/profile" icon={<UserRound className="size-5" aria-hidden="true" />} title="My Profile" description="Update your professional details and availability." />
          <QuickAction href="/doctor/appointments" icon={<ClipboardList className="size-5" aria-hidden="true" />} title="View All Appointments" description="Review every patient appointment in one place." />
        </section>

        <section className="mt-7 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm" aria-labelledby="upcoming-title">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6"><div><p className="text-sm font-medium text-[var(--brand)]">Schedule</p><h2 className="mt-1 text-xl font-semibold" id="upcoming-title">Upcoming appointments</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">{upcomingAppointments.length} upcoming</span></div>
          {loading ? <p className="px-6 py-12 text-center text-sm text-[var(--muted)]">Loading appointments…</p> : upcomingAppointments.length === 0 ? <div className="px-6 py-12 text-center"><CalendarDays className="mx-auto size-8 text-[var(--brand)]" aria-hidden="true" /><p className="mt-4 font-semibold">No upcoming appointments.</p><p className="mt-1 text-sm text-[var(--muted)]">Appointments booked by patients will appear here.</p></div> : <ul className="divide-y divide-[var(--line)]">{upcomingAppointments.map((appointment) => <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" key={appointment.id}><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full bg-emerald-100 font-semibold text-[var(--brand-deep)]">{appointment.patient.initials}</div><div><p className="font-semibold">{appointment.patient.name}</p><p className="mt-0.5 text-sm text-[var(--muted)]">{appointment.reason}</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><p className="text-sm font-medium">{formatDate(appointment.dateTime ?? appointment.startsAt)}</p><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusClasses[appointment.status]}`}>{appointment.status}</span><Link className="rounded-lg p-2 text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--brand)]" href={`/doctor/appointments?appointmentId=${encodeURIComponent(appointment.id)}`} aria-label={`View ${appointment.patient.name}'s details`} title="View patient details"><UserRound className="size-4" aria-hidden="true" /></Link><Link className="rounded-lg p-2 text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--brand)]" href={`/doctor/calendar?date=${encodeURIComponent((appointment.dateTime ?? appointment.startsAt).slice(0, 10))}`} aria-label={`Open calendar for ${appointment.patient.name}'s appointment`} title="Open calendar"><CalendarDays className="size-4" aria-hidden="true" /></Link></div></li>)}</ul>}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) { return <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm"><div><p className="text-xs font-medium text-[var(--muted)]">{label}</p><p className="mt-1 text-2xl font-semibold text-[var(--ink)]">{value}</p></div><span className={`grid size-10 place-items-center rounded-lg ${tone}`}>{icon}</span></div>; }
function QuickAction({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) { return <Link className="group rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--brand)] hover:shadow-md" href={href}><div className="flex items-start gap-4"><span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-[var(--brand)]">{icon}</span><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm text-[var(--muted)]">{description}</span></span><ChevronRight className="mt-1 size-5 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" aria-hidden="true" /></div></Link>; }
function formatDate(dateTime: string): string { return new Date(dateTime).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
