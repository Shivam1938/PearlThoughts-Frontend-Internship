"use client";

import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type DragEvent } from "react";
import { getDoctorAppointments } from "@/features/doctor/api/getAppointments";
import { getDoctorAvailability, type CalendarAvailabilitySlot } from "@/features/doctor/api/getAvailability";
import { updateDoctorAppointment } from "@/features/doctor/api/updateAppointment";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";
import type { Appointment } from "@/types/appointment";

type CalendarView = "day" | "week" | "month";
const views: CalendarView[] = ["day", "week", "month"];

// Bug 9: what the doctor drops an appointment onto -- the target day is known the moment
// the card is dropped, but the exact time is not decided until they confirm it in the modal.
type PendingDrop = { appointmentId: string; patientName: string; targetDate: string; time: string };

export default function DoctorCalendar() {
  const { doctor, isReady } = useDoctorAuth();
  const searchParams = useSearchParams();
  const [view, setView] = useState<CalendarView>("week");
  const [date, setDate] = useState(() => searchParams.get("date") ?? today());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<CalendarAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [saving, setSaving] = useState(false);
  const isLoading = !isReady || (doctor !== null && loading);

  useEffect(() => {
    if (!doctor) return;
    let active = true;
    void Promise.all([getDoctorAppointments(doctor.id), getDoctorAvailability(doctor.id)])
      .then(([nextAppointments, nextSlots]) => { if (active) { setAppointments(nextAppointments); setSlots(nextSlots); } })
      .catch(() => { if (active) setMessage("Calendar data could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doctor, refreshKey]);

  const dates = view === "day" ? [date] : view === "week" ? weekDates(date) : monthDates(date);

  // Bug 9: the whole day column is now a valid drop target -- previously only the
  // individual "Open slot" rows accepted a drop, so a doctor could only reschedule onto a
  // day that already happened to have a matching published slot. Most days have none, so
  // dragging there silently did nothing. Dropping anywhere on a day now opens a small
  // "what time?" prompt instead of requiring a pre-existing slot to land on.
  function handleDayDrop(event: DragEvent<HTMLElement>, targetDate: string): void {
    event.preventDefault();
    setDragOverDate(null);
    const appointmentId = event.dataTransfer.getData("text/appointment-id");
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment || !isDraggable(appointment)) { setMessage("Only confirmed or upcoming appointments can be moved."); return; }
    const current = new Date(appointment.dateTime ?? appointment.startsAt);
    setMessage(null);
    setPendingDrop({
      appointmentId: appointment.id,
      patientName: appointment.patient.name,
      targetDate,
      time: `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`,
    });
  }

  async function confirmReschedule(): Promise<void> {
    if (!doctor || !pendingDrop) return;
    const appointment = appointments.find((item) => item.id === pendingDrop.appointmentId);
    if (!appointment) { setPendingDrop(null); return; }
    const newStart = combineDateAndTime(pendingDrop.targetDate, pendingDrop.time);
    if (Number.isNaN(new Date(newStart).getTime())) { setMessage("Please choose a valid time."); return; }
    if (new Date(newStart).getTime() <= Date.now()) { setMessage("Choose a time in the future."); return; }
    const previousStart = appointment.dateTime ?? appointment.startsAt;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateDoctorAppointment(doctor.id, appointment.id, "reschedule", newStart);
      // Bug 11: apply the confirmed appointment straight to local state instead of only
      // waiting on a refetch, so the reschedule is reflected immediately and reliably --
      // a reload (or the refetch below) will show the same persisted result.
      setAppointments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSlots((current) => current.map((item) => {
        if (item.doctorId !== doctor.id) return item;
        if (item.start === newStart) return { ...item, isBooked: true };
        if (item.start === previousStart) return { ...item, isBooked: false };
        return item;
      }));
      setMessage(`${appointment.patient.name}'s appointment was rescheduled to ${formatFullDateTime(newStart)}. The doctor and patient have both been notified.`);
      setPendingDrop(null);
      setRefreshKey((current) => current + 1);
    } catch (error: unknown) { setMessage(error instanceof Error ? error.message : "The appointment could not be rescheduled."); } finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-7xl">
    <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Calendar</h1><p className="mt-2 text-[var(--muted)]">Drag an active appointment onto any day to reschedule it — you'll be asked to confirm the exact time.</p></div><div className="flex flex-wrap items-center gap-2"><button className="rounded-lg p-2 hover:bg-white" type="button" onClick={() => setDate(shiftDate(date, view, -1))} aria-label="Previous period"><ChevronLeft className="size-5" /></button><input className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button className="rounded-lg p-2 hover:bg-white" type="button" onClick={() => setDate(shiftDate(date, view, 1))} aria-label="Next period"><ChevronRight className="size-5" /></button><div className="flex rounded-lg border border-[var(--line)] bg-white p-1">{views.map((item) => <button className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${view === item ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"}`} type="button" key={item} onClick={() => setView(item)}>{item}</button>)}</div></div></header>
    {message && <p className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.includes("rescheduled") ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`} role="status">{message}</p>}
    <section className="mt-6 overflow-x-auto rounded-xl border border-[var(--line)] bg-white shadow-sm" aria-label={`${view} calendar`}>{isLoading ? <p className="px-6 py-16 text-center text-sm text-[var(--muted)]">Loading calendar…</p> : <div className={`grid min-w-[44rem] divide-x divide-[var(--line)] ${view === "day" ? "grid-cols-1" : view === "week" ? "grid-cols-7" : "grid-cols-7"}`}>{dates.map((day) => <CalendarDay key={day} date={day} appointments={appointments.filter((appointment) => appointmentDate(appointment) === day)} slots={slots.filter((slot) => slot.start.slice(0, 10) === day)} isDragOver={dragOverDate === day} onDragEnter={() => setDragOverDate(day)} onDragLeave={() => setDragOverDate((current) => (current === day ? null : current))} onDrop={(event) => handleDayDrop(event, day)} />)}</div>}</section>
    <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]"><span className="size-3 rounded bg-sky-100 ring-1 ring-sky-200" />Open availability <span className="ml-3 size-3 rounded bg-stone-100 ring-1 ring-stone-200" />Unavailable or booked <GripVertical className="ml-3 size-4" />Draggable active appointment</p>
  </div>
  {pendingDrop && <RescheduleModal pendingDrop={pendingDrop} saving={saving} onChangeTime={(time) => setPendingDrop((current) => (current ? { ...current, time } : current))} onCancel={() => setPendingDrop(null)} onConfirm={() => void confirmReschedule()} />}
  </main>;
}

function RescheduleModal({ pendingDrop, saving, onChangeTime, onCancel, onConfirm }: { pendingDrop: PendingDrop; saving: boolean; onChangeTime: (time: string) => void; onCancel: () => void; onConfirm: () => void }) {
  const dayLabel = new Date(`${pendingDrop.targetDate}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
  return <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="reschedule-modal-title">
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <h2 className="text-lg font-semibold" id="reschedule-modal-title">Reschedule appointment</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Move {pendingDrop.patientName}'s appointment to <span className="font-medium text-[var(--ink)]">{dayLabel}</span>. What time should it start?</p>
      <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">New time
        <input className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm" type="time" value={pendingDrop.time} onChange={(event) => onChangeTime(event.target.value)} autoFocus />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-stone-50" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" type="button" onClick={onConfirm} disabled={saving}>{saving ? "Rescheduling…" : "Confirm reschedule"}</button>
      </div>
    </div>
  </div>;
}

function CalendarDay({ date, appointments, slots, isDragOver, onDragEnter, onDragLeave, onDrop }: { date: string; appointments: Appointment[]; slots: CalendarAvailabilitySlot[]; isDragOver: boolean; onDragEnter: () => void; onDragLeave: () => void; onDrop: (event: DragEvent<HTMLElement>) => void }) {
  return <div className={`min-h-72 p-3 transition-colors ${isDragOver ? "bg-emerald-50/70" : ""}`} onDragOver={(event) => event.preventDefault()} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
    <div className="border-b border-[var(--line)] pb-2"><p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}</p><p className="font-semibold">{new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p></div>
    <div className="mt-3 space-y-2">
      {slots.map((slot) => slot.isBooked
        ? <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-2 py-2 text-xs text-stone-500" key={slot.start}>Unavailable · {formatTime(slot.start)}</div>
        : <div className="rounded-lg border border-dashed border-sky-300 bg-sky-50 px-2 py-2 text-xs font-medium text-sky-800" key={slot.start}>Open slot · {formatTime(slot.start)}</div>)}
      {appointments.map((appointment) => <AppointmentBlock appointment={appointment} key={appointment.id} />)}
      {slots.length === 0 && appointments.length === 0 && <p className="pt-5 text-center text-xs text-[var(--muted)]">No schedule entries</p>}
    </div>
  </div>;
}
function AppointmentBlock({ appointment }: { appointment: Appointment }) { const draggable = isDraggable(appointment); return <article className={`rounded-lg border px-2 py-2 text-xs ${draggable ? "cursor-grab border-emerald-200 bg-emerald-50 active:cursor-grabbing" : "border-stone-200 bg-stone-50 text-stone-600"}`} draggable={draggable} onDragStart={(event) => { event.dataTransfer.setData("text/appointment-id", appointment.id); event.dataTransfer.effectAllowed = "move"; }}><p className="flex items-center gap-1 font-semibold"><span>{formatTime(appointment.dateTime ?? appointment.startsAt)}</span>{draggable && <GripVertical className="size-3" />}</p><p className="mt-0.5 truncate">{appointment.patient.name}</p><p className="mt-0.5 capitalize text-[var(--muted)]">{appointment.status}</p></article>; }
function isDraggable(appointment: Appointment): boolean { return appointment.status === "confirmed" || appointment.status === "upcoming"; }
function appointmentDate(appointment: Appointment): string { return (appointment.dateTime ?? appointment.startsAt).slice(0, 10); }
// Bug 11: explicitly force 12-hour formatting so every time label on the calendar
// (open slots, unavailable slots, and appointment cards) always shows AM/PM.
function formatTime(dateTime: string): string { return new Date(dateTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }); }
function formatFullDateTime(dateTime: string): string { const date = new Date(dateTime); return `${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${formatTime(dateTime)}`; }
// Bug 9: combine the day the card was dropped on with the time the doctor confirms in the
// modal, using local wall-clock time -- this keeps the stored instant consistent with
// whatever time is displayed back on the calendar and in notifications.
function combineDateAndTime(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) return "invalid";
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}
function today(): string { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }
function shiftDate(date: string, view: CalendarView, direction: number): string { const next = new Date(`${date}T00:00:00`); next.setDate(next.getDate() + direction * (view === "day" ? 1 : view === "week" ? 7 : 30)); return toDateString(next); }
function weekDates(date: string): string[] { const start = new Date(`${date}T00:00:00`); start.setDate(start.getDate() - start.getDay()); return Array.from({ length: 7 }, (_, index) => { const next = new Date(start); next.setDate(start.getDate() + index); return toDateString(next); }); }
function monthDates(date: string): string[] { const start = new Date(`${date}T00:00:00`); start.setDate(1); start.setDate(start.getDate() - start.getDay()); return Array.from({ length: 42 }, (_, index) => { const next = new Date(start); next.setDate(start.getDate() + index); return toDateString(next); }); }
function toDateString(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
