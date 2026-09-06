"use client";

import { CalendarDays, CalendarPlus, Search, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDoctorAppointments } from "@/features/doctor/api/getAppointments";
import { type AppointmentAction, updateDoctorAppointment } from "@/features/doctor/api/updateAppointment";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

type StatusTab = "all" | AppointmentStatus;

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "missed", label: "Missed" },
];

const statusClasses: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200", confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200", upcoming: "bg-sky-50 text-sky-800 ring-sky-200", completed: "bg-emerald-50 text-emerald-800 ring-emerald-200", cancelled: "bg-stone-100 text-stone-600 ring-stone-200", missed: "bg-rose-50 text-rose-800 ring-rose-200",
};

export default function DoctorAppointments() {
  const { doctor, isReady } = useDoctorAuth();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusTab>("all");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("appointmentId"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [cardActionError, setCardActionError] = useState<string | null>(null);
  const [cardActionId, setCardActionId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const isLoading = !isReady || (doctor !== null && loading);

  useEffect(() => {
    if (!doctor) return;
    let active = true;
    void getDoctorAppointments(doctor.id, status === "all" ? undefined : status)
      .then((data) => {
        if (!active) return;
        setAppointments(data);
        setSelectedId((current) => data.some((appointment) => appointment.id === current) ? current : (data[0]?.id ?? null));
      })
      .catch(() => { if (active) setError("Appointments could not be loaded. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doctor, refreshKey, status]);

  const filteredAppointments = appointments.filter((appointment) =>
    !dismissedIds.includes(appointment.id) && (!date || appointmentDate(appointment) === date) && (!query.trim() || appointment.patient.name.toLowerCase().includes(query.trim().toLowerCase())),
  );
  const selectedAppointment = filteredAppointments.find((appointment) => appointment.id === selectedId) ?? null;
  async function runAction(action: AppointmentAction, startsAt?: string): Promise<void> {
    if (!doctor || !selectedAppointment) return;
    setActionError(null);
    setIsSaving(true);
    try {
      await updateDoctorAppointment(doctor.id, selectedAppointment.id, action, startsAt);
      setIsRescheduling(false);
      setRefreshKey((current) => current + 1);
    } catch (actionFailure: unknown) { setActionError(actionFailure instanceof Error ? actionFailure.message : "Unable to update appointment."); }
    finally { setIsSaving(false); }
  }
  async function handleCardControl(appointment: Appointment): Promise<void> {
    if (appointment.status === "completed" || appointment.status === "cancelled" || appointment.status === "missed") {
      setDismissedIds((current) => [...current, appointment.id]);
      return;
    }
    if (!doctor) return;
    setCardActionError(null);
    setCardActionId(appointment.id);
    try {
      await updateDoctorAppointment(doctor.id, appointment.id, "cancel");
      setRefreshKey((current) => current + 1);
    } catch (actionFailure: unknown) { setCardActionError(actionFailure instanceof Error ? actionFailure.message : "Unable to cancel appointment."); }
    finally { setCardActionId(null); }
  }

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-6xl">
    <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">All Appointments</h1><p className="mt-2 text-[var(--muted)]">Review and filter appointments booked with your practice.</p></div><Link className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]" href="/doctor/slots"><CalendarPlus className="size-4" aria-hidden="true" />Manage Slots</Link></header>
    <section className="mt-7 rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-5" aria-label="Appointment filters"><div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Appointment status">{statusTabs.map((tab) => <button className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${status === tab.value ? "bg-[var(--brand)] text-white" : "text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--ink)]"}`} type="button" role="tab" aria-selected={status === tab.value} key={tab.value} onClick={() => { setLoading(true); setError(null); setStatus(tab.value); }}>{tab.label}</button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="relative"><span className="sr-only">Search by patient name</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" /><input className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-emerald-100" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by patient name" /></label><label><span className="sr-only">Filter by date</span><input className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-emerald-100" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div></section>
    <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]" aria-live="polite"><div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm"><div className="border-b border-[var(--line)] px-5 py-4 sm:px-6"><p className="text-sm text-[var(--muted)]">Showing {filteredAppointments.length} appointment{filteredAppointments.length === 1 ? "" : "s"}</p></div>{cardActionError && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700" role="alert">{cardActionError}</p>}{isLoading ? <p className="px-6 py-12 text-center text-sm text-[var(--muted)]">Loading appointments…</p> : error ? <p className="px-6 py-12 text-center text-sm text-rose-700">{error}</p> : filteredAppointments.length === 0 ? <EmptyState /> : <ul className="divide-y divide-[var(--line)]">{filteredAppointments.map((appointment) => <li className="flex items-center" key={appointment.id}><button className={`grid min-w-0 flex-1 gap-3 px-5 py-4 text-left transition hover:bg-stone-50 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 ${selectedId === appointment.id ? "bg-emerald-50/60" : ""}`} type="button" onClick={() => setSelectedId(appointment.id)} aria-pressed={selectedId === appointment.id}><span className="min-w-0"><span className="block truncate font-semibold">{appointment.patient.name}</span><span className="mt-0.5 block text-sm text-[var(--muted)]">{appointment.type ?? appointment.reason} · {formatDate(appointment)}</span></span><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusClasses[appointment.status]}`}>{appointment.status}</span></button><button className="mr-5 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => void handleCardControl(appointment)} disabled={cardActionId === appointment.id} aria-label={`${appointment.status === "pending" || appointment.status === "confirmed" || appointment.status === "upcoming" ? "Cancel" : "Dismiss"} ${appointment.patient.name}'s appointment`} title={appointment.status === "pending" || appointment.status === "confirmed" || appointment.status === "upcoming" ? "Cancel appointment" : "Dismiss appointment"}><Trash2 className="size-4" /></button></li>)}</ul>}</div><AppointmentDetails appointment={selectedAppointment} actionError={actionError} isRescheduling={isRescheduling} isSaving={isSaving} now={now} rescheduleTime={rescheduleTime} onAction={runAction} onRescheduleTimeChange={setRescheduleTime} onStartReschedule={() => { setActionError(null); setRescheduleTime(selectedAppointment ? toLocalInputValue(selectedAppointment.dateTime ?? selectedAppointment.startsAt) : ""); setIsRescheduling(true); }} onStopReschedule={() => setIsRescheduling(false)} /></section>
  </div></main>;
}

function AppointmentDetails({ appointment, actionError, isRescheduling, isSaving, now, rescheduleTime, onAction, onRescheduleTimeChange, onStartReschedule, onStopReschedule }: { appointment: Appointment | null; actionError: string | null; isRescheduling: boolean; isSaving: boolean; now: number; rescheduleTime: string; onAction: (action: AppointmentAction, startsAt?: string) => Promise<void>; onRescheduleTimeChange: (value: string) => void; onStartReschedule: () => void; onStopReschedule: () => void }) {
  const canMarkOutcome = appointment && (appointment.status === "confirmed" || appointment.status === "upcoming") && new Date(appointment.dateTime ?? appointment.startsAt).getTime() <= now;
  const canChange = appointment && (appointment.status === "confirmed" || appointment.status === "upcoming") && !canMarkOutcome;
  return <aside className="h-fit rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm" aria-label="Appointment details"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-[var(--brand-deep)]"><UserRound className="size-5" aria-hidden="true" /></span><div><p className="text-sm font-medium text-[var(--brand)]">Appointment details</p><h2 className="font-semibold">{appointment?.patient.name ?? "Select an appointment"}</h2></div></div>{!appointment ? <p className="mt-5 text-sm text-[var(--muted)]">Choose an appointment from the list to view its details.</p> : <><dl className="mt-5 space-y-4 text-sm"><Detail label="Date and time" value={formatDate(appointment)} /><Detail label="Appointment type" value={appointment.type ?? appointment.reason} /><Detail label="Status" value={appointment.status} /><Detail label="Patient phone" value={appointment.patientPhone ?? "Not provided"} /><Detail label="Notes" value={appointment.notes ?? appointment.note ?? "No notes provided"} /></dl><div className="mt-6 border-t border-[var(--line)] pt-5"><p className="text-sm font-semibold">Actions</p>{appointment.status === "pending" && <div className="mt-3 grid grid-cols-2 gap-2"><ActionButton label="Confirm" onClick={() => void onAction("confirm")} disabled={isSaving} /><ActionButton label="Decline" onClick={() => void onAction("decline")} disabled={isSaving} tone="danger" /></div>}{canChange && <div className="mt-3 grid gap-2"><ActionButton label="Reschedule" onClick={onStartReschedule} disabled={isSaving} /><ActionButton label="Cancel appointment" onClick={() => void onAction("cancel")} disabled={isSaving} tone="danger" />{isRescheduling && <div className="rounded-lg bg-stone-50 p-3"><label className="block text-xs font-medium text-[var(--muted)]">New date and time<input className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm" type="datetime-local" value={rescheduleTime} onChange={(event) => onRescheduleTimeChange(event.target.value)} /></label><div className="mt-3 flex gap-2"><ActionButton label="Save time" onClick={() => void onAction("reschedule", new Date(rescheduleTime).toISOString())} disabled={isSaving || !rescheduleTime} /><button className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-white" type="button" onClick={onStopReschedule}>Close</button></div></div>}</div>}{canMarkOutcome && <div className="mt-3 grid grid-cols-2 gap-2"><ActionButton label="Mark completed" onClick={() => void onAction("complete")} disabled={isSaving} /><ActionButton label="Mark missed" onClick={() => void onAction("miss")} disabled={isSaving} tone="danger" /></div>}{(appointment.status === "completed" || appointment.status === "cancelled" || appointment.status === "missed") && <p className="mt-3 text-sm text-[var(--muted)]">This appointment is read-only.</p>}{actionError && <p className="mt-3 text-sm text-rose-700" role="alert">{actionError}</p>}</div></>}</aside>;
}
function ActionButton({ label, onClick, disabled, tone = "primary" }: { label: string; onClick: () => void; disabled: boolean; tone?: "primary" | "danger" }) { return <button className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${tone === "danger" ? "border border-red-200 text-red-700 hover:bg-red-50" : "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]"}`} type="button" onClick={onClick} disabled={disabled}>{disabled ? "Saving…" : label}</button>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt><dd className="mt-1 font-medium capitalize text-[var(--ink)]">{value}</dd></div>; }
function EmptyState() { return <div className="px-6 py-14 text-center"><CalendarDays className="mx-auto size-8 text-[var(--brand)]" aria-hidden="true" /><p className="mt-4 font-semibold">No appointments found</p><p className="mt-1 text-sm text-[var(--muted)]">Try changing your filters.</p></div>; }
function appointmentDate(appointment: Appointment): string { return (appointment.dateTime ?? appointment.startsAt).slice(0, 10); }
function formatDate(appointment: Appointment): string { return new Date(appointment.dateTime ?? appointment.startsAt).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); }
function toLocalInputValue(dateTime: string): string { const date = new Date(dateTime); const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
