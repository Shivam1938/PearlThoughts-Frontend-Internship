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
  async function moveAppointment(event: DragEvent<HTMLElement>, slot: CalendarAvailabilitySlot): Promise<void> {
    event.preventDefault();
    const appointmentId = event.dataTransfer.getData("text/appointment-id");
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!doctor || !appointment || !isDraggable(appointment)) { setMessage("Only confirmed or upcoming appointments can be moved."); return; }
    if (slot.isBooked) { setMessage("That time is unavailable."); return; }
    setLoading(true);
    setMessage(null);
    try {
      await updateDoctorAppointment(doctor.id, appointment.id, "reschedule", slot.start);
      setMessage(`${appointment.patient.name}'s appointment was rescheduled.`);
      setRefreshKey((current) => current + 1);
    } catch (error: unknown) { setLoading(false); setMessage(error instanceof Error ? error.message : "The appointment could not be rescheduled."); }
  }
  function rejectUnavailableDrop(event: DragEvent<HTMLElement>): void { event.preventDefault(); setMessage("That time is unavailable. Drop appointments only onto open availability slots."); }

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-7xl">
    <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Calendar</h1><p className="mt-2 text-[var(--muted)]">Drag an active appointment onto an open availability slot to reschedule it.</p></div><div className="flex flex-wrap items-center gap-2"><button className="rounded-lg p-2 hover:bg-white" type="button" onClick={() => setDate(shiftDate(date, view, -1))} aria-label="Previous period"><ChevronLeft className="size-5" /></button><input className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button className="rounded-lg p-2 hover:bg-white" type="button" onClick={() => setDate(shiftDate(date, view, 1))} aria-label="Next period"><ChevronRight className="size-5" /></button><div className="flex rounded-lg border border-[var(--line)] bg-white p-1">{views.map((item) => <button className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${view === item ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"}`} type="button" key={item} onClick={() => setView(item)}>{item}</button>)}</div></div></header>
    {message && <p className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.includes("rescheduled") ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`} role="status">{message}</p>}
    <section className="mt-6 overflow-x-auto rounded-xl border border-[var(--line)] bg-white shadow-sm" aria-label={`${view} calendar`}>{isLoading ? <p className="px-6 py-16 text-center text-sm text-[var(--muted)]">Loading calendar…</p> : <div className={`grid min-w-[44rem] divide-x divide-[var(--line)] ${view === "day" ? "grid-cols-1" : view === "week" ? "grid-cols-7" : "grid-cols-7"}`}>{dates.map((day) => <CalendarDay key={day} date={day} appointments={appointments.filter((appointment) => appointmentDate(appointment) === day)} slots={slots.filter((slot) => slot.start.slice(0, 10) === day)} onDrop={moveAppointment} onUnavailableDrop={rejectUnavailableDrop} />)}</div>}</section>
    <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]"><span className="size-3 rounded bg-sky-100 ring-1 ring-sky-200" />Open availability <span className="ml-3 size-3 rounded bg-stone-100 ring-1 ring-stone-200" />Unavailable or booked <GripVertical className="ml-3 size-4" />Draggable active appointment</p>
  </div></main>;
}

function CalendarDay({ date, appointments, slots, onDrop, onUnavailableDrop }: { date: string; appointments: Appointment[]; slots: CalendarAvailabilitySlot[]; onDrop: (event: DragEvent<HTMLElement>, slot: CalendarAvailabilitySlot) => Promise<void>; onUnavailableDrop: (event: DragEvent<HTMLElement>) => void }) { return <div className="min-h-72 p-3"><div className="border-b border-[var(--line)] pb-2"><p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}</p><p className="font-semibold">{new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p></div><div className="mt-3 space-y-2">{slots.map((slot) => slot.isBooked ? <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-2 py-2 text-xs text-stone-500" key={slot.start} onDragOver={(event) => event.preventDefault()} onDrop={onUnavailableDrop}>Unavailable · {formatTime(slot.start)}</div> : <div className="rounded-lg border border-dashed border-sky-300 bg-sky-50 px-2 py-2 text-xs font-medium text-sky-800" key={slot.start} onDragOver={(event) => event.preventDefault()} onDrop={(event) => void onDrop(event, slot)}>Open slot · {formatTime(slot.start)}</div>)}{appointments.map((appointment) => <AppointmentBlock appointment={appointment} key={appointment.id} />)}{slots.length === 0 && appointments.length === 0 && <p className="pt-5 text-center text-xs text-[var(--muted)]">No schedule entries</p>}</div></div>; }
function AppointmentBlock({ appointment }: { appointment: Appointment }) { const draggable = isDraggable(appointment); return <article className={`rounded-lg border px-2 py-2 text-xs ${draggable ? "cursor-grab border-emerald-200 bg-emerald-50 active:cursor-grabbing" : "border-stone-200 bg-stone-50 text-stone-600"}`} draggable={draggable} onDragStart={(event) => { event.dataTransfer.setData("text/appointment-id", appointment.id); event.dataTransfer.effectAllowed = "move"; }}><p className="flex items-center gap-1 font-semibold"><span>{formatTime(appointment.dateTime ?? appointment.startsAt)}</span>{draggable && <GripVertical className="size-3" />}</p><p className="mt-0.5 truncate">{appointment.patient.name}</p><p className="mt-0.5 capitalize text-[var(--muted)]">{appointment.status}</p></article>; }
function isDraggable(appointment: Appointment): boolean { return appointment.status === "confirmed" || appointment.status === "upcoming"; }
function appointmentDate(appointment: Appointment): string { return (appointment.dateTime ?? appointment.startsAt).slice(0, 10); }
function formatTime(dateTime: string): string { return new Date(dateTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); }
function today(): string { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; }
function shiftDate(date: string, view: CalendarView, direction: number): string { const next = new Date(`${date}T00:00:00`); next.setDate(next.getDate() + direction * (view === "day" ? 1 : view === "week" ? 7 : 30)); return toDateString(next); }
function weekDates(date: string): string[] { const start = new Date(`${date}T00:00:00`); start.setDate(start.getDate() - start.getDay()); return Array.from({ length: 7 }, (_, index) => { const next = new Date(start); next.setDate(start.getDate() + index); return toDateString(next); }); }
function monthDates(date: string): string[] { const start = new Date(`${date}T00:00:00`); start.setDate(1); start.setDate(start.getDate() - start.getDay()); return Array.from({ length: 42 }, (_, index) => { const next = new Date(start); next.setDate(start.getDate() + index); return toDateString(next); }); }
function toDateString(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
