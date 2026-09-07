"use client";

import Link from "next/link";
import { CalendarPlus, Clock3, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { loadDoctorAvailability, removeDoctorAvailabilitySlot, saveDoctorAvailability } from "@/features/doctor/availability";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";
import { updateDoctorAppointment } from "@/features/doctor/api/updateAppointment";
import type { DoctorAvailabilitySlot } from "@/features/doctor/types";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fieldClass = "mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100";

export default function DoctorSlots() {
  const { doctor } = useDoctorAuth();
  const [slots, setSlots] = useState<DoctorAvailabilitySlot[]>(() => doctor ? loadDoctorAvailability(doctor.id) : []);
  const [message, setMessage] = useState("");
  const [slotError, setSlotError] = useState("");
  const [slotForm, setSlotForm] = useState({ date: today(), startTime: "09:00", endTime: "09:30", isRecurring: false, daysOfWeek: [] as number[], endDate: addDays(28) });

  const availableCount = useMemo(() => slots.filter((slot) => slot.status === "available").length, [slots]);
  if (!doctor) return null;
  const doctorId = doctor.id;

  function toggleDay(day: number): void { setSlotForm((current) => ({ ...current, daysOfWeek: current.daysOfWeek.includes(day) ? current.daysOfWeek.filter((item) => item !== day) : [...current.daysOfWeek, day] })); }
  function addSlots(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault(); setSlotError(""); setMessage("");
    if (slotForm.endTime <= slotForm.startTime) return setSlotError("End time must be after the start time.");
    if (slotForm.date < today()) return setSlotError("Choose today or a future date.");
    if (slotForm.isRecurring && (!slotForm.endDate || slotForm.endDate < slotForm.date || slotForm.daysOfWeek.length === 0)) return setSlotError("Choose at least one day and a valid recurrence end date.");
    const dates = slotForm.isRecurring ? recurringDates(slotForm.date, slotForm.endDate, slotForm.daysOfWeek) : [slotForm.date];
    // Bug 9: without this check, adding a slot that overlaps an existing one (recurring
    // series included) created two entries for the same date + time. Both looked
    // "available" independently, so patients saw the same time slot listed twice.
    const existingKeys = new Set(slots.map((slot) => `${slot.date}T${slot.startTime}`));
    const duplicateDates = dates.filter((date) => existingKeys.has(`${date}T${slotForm.startTime}`));
    if (duplicateDates.length > 0) return setSlotError(`You already have a slot at ${formatTime(slotForm.startTime)} on ${duplicateDates.length === 1 ? formatDate(duplicateDates[0]) : `${duplicateDates.length} of the selected dates`}. Choose a different time.`);
    const newSlots = dates.map((date, index): DoctorAvailabilitySlot => ({ id: `availability-${Date.now()}-${index}`, doctorId, date, startTime: slotForm.startTime, endTime: slotForm.endTime, isRecurring: slotForm.isRecurring, recurrenceRule: slotForm.isRecurring ? { frequency: "weekly", daysOfWeek: slotForm.daysOfWeek, endDate: slotForm.endDate } : undefined, status: "available" }));
    const merged = [...slots, ...newSlots]; saveDoctorAvailability(merged); setSlots(merged); setMessage(`${newSlots.length} availability ${newSlots.length === 1 ? "slot" : "slots"} added.`);
  }
  // Bug 10: every slot row needs a working delete control. A booked slot backs a real
  // appointment, so deleting it must confirm first and actually cancel that appointment
  // instead of quietly refusing (the old disabled button did nothing at all).
  async function deleteSlot(slot: DoctorAvailabilitySlot): Promise<void> {
    setSlotError(""); setMessage("");
    if (slot.status === "booked") {
      const confirmed = window.confirm(`This slot on ${formatDate(slot.date)} at ${formatTime(slot.startTime)} has a booked appointment. Deleting it will cancel that appointment. Continue?`);
      if (!confirmed) return;
      if (slot.appointmentId) {
        try {
          await updateDoctorAppointment(doctorId, slot.appointmentId, "cancel");
        } catch (error) {
          setSlotError(error instanceof Error ? error.message : "Unable to cancel the appointment for this slot.");
          return;
        }
      }
    }
    removeDoctorAvailabilitySlot(doctorId, slot.id);
    setSlots((current) => current.filter((item) => item.id !== slot.id));
    setMessage("Slot deleted.");
  }

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-6xl">
    <header className="flex flex-col gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Manage Slots</h1><p className="mt-2 text-[var(--muted)]">Add new availability and manage your existing appointment slots.</p></div><Link className="font-semibold text-[var(--brand)] hover:underline" href="/doctor/appointments">Back to appointments</Link></header>

    <div className="mt-7 grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
      <section className="h-fit rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-[var(--brand)]"><CalendarPlus className="size-5" /></span><div><h2 className="text-xl font-semibold">Appointment availability</h2><p className="mt-1 text-sm text-[var(--muted)]">{availableCount} available {availableCount === 1 ? "slot" : "slots"}</p></div></div><form className="mt-6" onSubmit={addSlots}><div className="grid gap-4 sm:grid-cols-2"><Field label="Start date" type="date" min={today()} value={slotForm.date} onChange={(date) => setSlotForm((current) => ({ ...current, date }))} /><Field label="End date" type="date" min={slotForm.date} value={slotForm.endDate} disabled={!slotForm.isRecurring} onChange={(endDate) => setSlotForm((current) => ({ ...current, endDate }))} /><Field label="Start time" type="time" value={slotForm.startTime} onChange={(startTime) => setSlotForm((current) => ({ ...current, startTime }))} /><Field label="End time" type="time" value={slotForm.endTime} onChange={(endTime) => setSlotForm((current) => ({ ...current, endTime }))} /></div><label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-medium"><input className="size-4 accent-[var(--brand)]" type="checkbox" checked={slotForm.isRecurring} onChange={(event) => setSlotForm((current) => ({ ...current, isRecurring: event.target.checked }))} />Repeat weekly</label>{slotForm.isRecurring && <fieldset className="mt-3"><legend className="text-sm font-medium">Repeat on</legend><div className="mt-2 flex flex-wrap gap-2">{weekdayNames.map((day, index) => <label key={day} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${slotForm.daysOfWeek.includes(index) ? "border-[var(--brand)] bg-emerald-50 text-[var(--brand-deep)]" : "border-[var(--line)]"}`}><input className="sr-only" type="checkbox" checked={slotForm.daysOfWeek.includes(index)} onChange={() => toggleDay(index)} />{day}</label>)}</div></fieldset>}{slotError && <p className="mt-4 text-sm text-red-700" role="alert">{slotError}</p>}{message && <p className="mt-4 text-sm font-medium text-emerald-700" role="status">{message}</p>}<button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]" type="submit"><Clock3 className="size-4" />Add availability</button></form></section>

      <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm"><div className="border-b border-[var(--line)] px-5 py-4 sm:px-6"><h2 className="text-xl font-semibold">Manage slots</h2><p className="mt-1 text-sm text-[var(--muted)]">Recurring availability is expanded into individual dates.</p></div>{slots.length === 0 ? <p className="px-6 py-10 text-center text-sm text-[var(--muted)]">No availability added yet.</p> : <ul className="divide-y divide-[var(--line)]">{slots.map((slot) => <li className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6" key={slot.id}><div><p className="font-semibold">{formatDate(slot.date)} · {formatTime(slot.startTime)}–{formatTime(slot.endTime)}</p><p className="mt-1 text-sm text-[var(--muted)]">{slot.isRecurring ? "Weekly recurring slot" : "One-time slot"} · <span className="capitalize">{slot.status}</span></p></div><button className="rounded-lg p-2 text-red-700 hover:bg-red-50" type="button" onClick={() => void deleteSlot(slot)} aria-label={slot.status === "booked" ? `Cancel appointment and delete slot on ${slot.date}` : `Delete slot on ${slot.date}`} title={slot.status === "booked" ? "This will cancel the booked appointment" : "Delete slot"}><Trash2 className="size-4" /></button></li>)}</ul>}</section>
    </div>
  </div></main>;
}

function Field({ label, value, onChange, type = "text", min, disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "date" | "time"; min?: string; disabled?: boolean }) { return <label className="block text-sm font-medium">{label}<input className={fieldClass} type={type} min={min} disabled={disabled} lang={type === "time" ? "en-US" : undefined} value={value} onChange={(event) => onChange(event.target.value)} />{type === "time" && value && <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{formatTime(value)}</span>}</label>; }
function today(): string { return new Date().toISOString().slice(0, 10); }
function addDays(days: number): string { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
function recurringDates(start: string, end: string, days: number[]): string[] { const dates: string[] = []; const cursor = new Date(`${start}T00:00:00`); const last = new Date(`${end}T00:00:00`); while (cursor <= last) { if (days.includes(cursor.getDay())) dates.push(cursor.toISOString().slice(0, 10)); cursor.setDate(cursor.getDate() + 1); } return dates; }
function formatDate(date: string): string { return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }); }
function formatTime(time: string): string { return new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); }
