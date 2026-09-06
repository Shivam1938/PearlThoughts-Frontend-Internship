"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock3, Search, ShieldAlert, Trash2 } from "lucide-react";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { getPatientAppointments } from "@/features/appointments/api/getPatientAppointments";
import { createAppointment } from "@/features/booking/api/createAppointment";
import { deleteBookedAppointment, loadBookedAppointments, subscribeToBookingChanges } from "@/features/booking/storage";
import type { BookedAppointment } from "@/features/booking/types";
import { useAuth } from "@/features/auth/hooks/auth-context";

type Filter = "upcoming" | "completed" | "cancelled" | "missed";
type ScheduleAppointment = Appointment & {
  source: "clinic" | "booking";
  booking?: BookedAppointment;
};

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  upcoming: "bg-sky-50 text-sky-800 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  missed: "bg-rose-50 text-rose-800 ring-rose-200",
};

const patientStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  upcoming: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  missed: "Missed",
};

function convertTo24Hour(value: string): string {
  const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "09:00:00";
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${match[2]}:00`;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${value}T00:00:00`));
}

function bookingToAppointment(booking: BookedAppointment): ScheduleAppointment {
  return {
    id: booking.id,
    patient: { name: booking.patientName, initials: booking.patientName.slice(0, 2).toUpperCase(), age: 0 },
    patientPhone: booking.patientPhone,
    clinician: booking.doctorName,
    specialty: booking.specialty,
    startsAt: `${booking.date}T${convertTo24Hour(booking.time)}`,
    durationMinutes: 30,
    status: booking.status,
    reason: booking.visitType,
    photo: booking.photo,
    note: booking.note,
    source: "booking",
    booking,
  };
}

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState<ScheduleAppointment[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [selectedId, setSelectedId] = useState<string>();
  const [selectedDate, setSelectedDate] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<ScheduleAppointment | null>(null);
  const [reviewDoctor, setReviewDoctor] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [bookingVersion, setBookingVersion] = useState(0);

  useEffect(() => subscribeToBookingChanges(() => setBookingVersion((current) => current + 1)), []);

  useEffect(() => {
    let isActive = true;
    async function loadSchedule(): Promise<void> {
      try {
        if (!user) return;
        const legacyBookings = loadBookedAppointments(user.id);
        await Promise.all(legacyBookings.filter((booking) => booking.status === "pending").map(async (booking) => {
          await createAppointment({
            patientId: booking.userId,
            patientName: booking.patientName,
            patientPhone: booking.patientPhone,
            doctorId: booking.doctorId,
            doctorName: booking.doctorName,
            specialty: booking.specialty,
            photo: booking.photo,
            startsAt: `${booking.date}T${convertTo24Hour(booking.time)}`,
            type: booking.visitType,
            notes: booking.note,
          });
          deleteBookedAppointment(user.id, booking.id);
        }));
        const appointments = await getPatientAppointments(user.id);
        const nextItems = [
          ...appointments.map((item) => ({ ...item, source: "clinic" as const })),
          ...(user ? loadBookedAppointments(user.id).map(bookingToAppointment) : []),
        ].sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
        if (!isActive) return;
        setItems(nextItems);
        setSelectedId(nextItems[0]?.id);
        setSelectedDate(nextItems[0]?.startsAt.slice(0, 10) ?? "");
        setStatus("ready");
      } catch {
        if (isActive) setStatus("error");
      }
    }
    void loadSchedule();
    return () => { isActive = false; };
  }, [user, bookingVersion]);

  const dates = useMemo(() => Array.from(new Set(items.map((item) => item.startsAt.slice(0, 10)))), [items]);
  const dateItems = useMemo(() => items.filter((item) => item.startsAt.slice(0, 10) === selectedDate), [items, selectedDate]);
  const visible = useMemo(() => dateItems.filter((item) => filter === "upcoming" ? item.status === "pending" || item.status === "confirmed" || item.status === "upcoming" : item.status === filter), [dateItems, filter]);
  const selected = items.find((item) => item.id === selectedId);
  const tabCounts = dateItems.reduce<Record<Filter, number>>((total, item) => ({ ...total, [item.status === "pending" || item.status === "confirmed" || item.status === "upcoming" ? "upcoming" : item.status]: total[item.status === "pending" || item.status === "confirmed" || item.status === "upcoming" ? "upcoming" : item.status] + 1 }), { upcoming: 0, completed: 0, cancelled: 0, missed: 0 });
  const counts = items.reduce<Record<AppointmentStatus, number>>((total, item) => ({ ...total, [item.status]: total[item.status] + 1 }), { confirmed: 0, pending: 0, upcoming: 0, completed: 0, cancelled: 0, missed: 0 });
  const specialties = useMemo(() => {
    const defaultSpecialties = ["Cardiology", "Dentistry", "Dermatology", "Neurology", "Pediatrics"];
    const availableSpecialties = Array.from(new Set(items.map((item) => item.specialty)));
    return Array.from(new Set([...availableSpecialties, ...defaultSpecialties])).slice(0, 5);
  }, [items]);
  const [currentTime] = useState(() => Date.now());
  const upcomingAppointment = items.find((item) => item.status !== "cancelled" && new Date(item.startsAt).getTime() >= currentTime);
  const totalBooked = items.length;
  const completed = tabCounts.completed;
  const cancelled = items.filter((item) => item.status === "cancelled").length;

  function confirmDelete(): void {
    if (!deleteCandidate?.booking) return;
    if (!user) return;
    deleteBookedAppointment(user.id, deleteCandidate.id);
    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setSelectedId((current) => current === deleteCandidate.id ? undefined : current);
    setDeleteCandidate(null);
  }

  function selectDate(date: string): void {
    setSelectedDate(date);
    const firstAppointment = items.find((item) => item.startsAt.slice(0, 10) === date);
    setSelectedId(firstAppointment?.id);
  }

  function openReview(doctor: string): void {
    setReviewDoctor(doctor);
    setReviewRating("5");
    setReviewComment("");
    setReviewSubmitted(false);
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-label="Dashboard overview">
          <div className="dashboard-overview-card relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6">
            <div className="dashboard-overview-glow absolute right-0 top-0 h-full w-1/3 bg-gradient-to-br from-sky-50 via-white to-transparent" aria-hidden="true" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Your care dashboard</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">Welcome back, {user?.name ?? "there"}!</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {upcomingAppointment
                ? `Your upcoming consultation with ${upcomingAppointment.clinician} is ${formatDate(upcomingAppointment.startsAt.slice(0, 10))} at ${formatTime(upcomingAppointment.startsAt)}.`
                : "Your care schedule is ready whenever you are."}
              </p>
              <div className="mt-5">
                <div className="dashboard-next-card rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Next on your calendar</p>
                  <p className="mt-2 font-semibold text-[var(--ink)]">{upcomingAppointment ? upcomingAppointment.clinician : "No upcoming visits"}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{upcomingAppointment ? `${formatDate(upcomingAppointment.startsAt.slice(0, 10))} · ${formatTime(upcomingAppointment.startsAt)}` : "Find a doctor when you are ready."}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="size-4" /> {counts.confirmed} confirmed</span>
                <span className="inline-flex items-center gap-1.5 text-sky-700"><CalendarCheck className="size-4" /> {totalBooked} total visits</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--ink)]">Search doctor specialty</p>
              <Search className="size-4 text-[var(--brand)]" aria-hidden="true" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {specialties.map((specialty) => <button key={specialty} type="button" onClick={() => window.location.assign(`/doctors?specialty=${encodeURIComponent(specialty)}`)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700">{specialty}</button>)}
            </div>
            <button type="button" onClick={() => window.location.assign("/doctors")} className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700">Explore All Specialties</button>
          </div>
        </section>
        <section className="grid gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Appointment summary">
          {[
            { label: "Total booked", value: totalBooked, icon: CalendarCheck, tone: "bg-sky-50 text-sky-600" },
            { label: "Completed", value: completed, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
            { label: "Pending", value: items.filter((item) => item.status === "pending").length, icon: Clock3, tone: "bg-amber-50 text-amber-600" },
            { label: "Cancelled", value: cancelled, icon: ShieldAlert, tone: "bg-rose-50 text-rose-600" },
          ].map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm"><div><p className="text-xs font-medium text-[var(--muted)]">{label}</p><p className="mt-1 text-2xl font-semibold text-[var(--ink)]">{value}</p></div><span className={`grid size-10 place-items-center rounded-lg ${tone}`}><Icon className="size-5" aria-hidden="true" /></span></div>)}
        </section>
        <section className="py-8" aria-labelledby="dashboard-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-[var(--brand)]">{selectedDate ? formatDate(selectedDate) : "Your care schedule"}</p>
              <h1 id="dashboard-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your appointments</h1>
              <p className="mt-2 max-w-xl text-[var(--muted)]">Keep track of where you need to be, when to arrive, and what each visit is for.</p>
            </div>
            <p className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">{tabCounts.upcoming} upcoming</span> of {items.length} visits</p>
          </div>
          {dates.length > 0 && <div className="mt-6 flex flex-wrap gap-2" aria-label="Choose schedule date">
            {dates.map((date) => <button key={date} type="button" onClick={() => selectDate(date)} className={`rounded-xl border px-4 py-2 text-left text-sm ${selectedDate === date ? "border-sky-600 bg-sky-50 text-sky-700" : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-sky-300"}`}><span className="block font-semibold">{new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(new Date(`${date}T00:00:00`))}</span><span>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`))}</span></button>)}
          </div>}
        </section>
        {status === "loading" && <p className="rounded-xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Loading your schedule...</p>}
        {status === "error" && <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">Unable to load your schedule.</p>}
        {status === "ready" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-white" aria-labelledby="schedule-title">
            <div className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><h2 id="schedule-title" className="font-semibold">Schedule</h2><div className="flex gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter appointments">{(["upcoming", "completed", "cancelled", "missed"] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-md px-3 py-1.5 text-sm capitalize ${filter === item ? "bg-white font-semibold shadow-sm" : "text-[var(--muted)]"}`}>{item} <span className="ml-1 text-xs">{tabCounts[item]}</span></button>)}</div></div>
            {visible.length === 0 ? <p className="p-6 text-sm text-[var(--muted)]">No appointments for this date and filter.</p> : <div>{visible.map((item) => <div key={item.id} className={`flex items-center border-b border-[var(--line)] last:border-b-0 hover:bg-sky-50/50 ${selectedId === item.id ? "bg-sky-50/60" : ""}`}><button type="button" onClick={() => setSelectedId(item.id)} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"><span className="w-16 shrink-0 text-sm text-[var(--muted)]">{formatTime(item.startsAt)}</span><span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{item.clinician.slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{item.clinician} <span className="font-normal text-[var(--muted)]">· {item.durationMinutes} min</span></span><span className="mt-1 block truncate text-sm text-[var(--muted)]">{formatDate(item.startsAt.slice(0, 10))} · {item.reason}</span></span><span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyles[item.status]}`}>{patientStatusLabels[item.status]}</span></button>{item.booking && <button type="button" onClick={() => setDeleteCandidate(item)} className="mr-4 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${item.clinician}'s appointment`} title="Delete appointment"><Trash2 className="size-4" /></button>}</div>)}</div>}
          </section>
          <aside className="rounded-xl border border-[var(--line)] bg-white p-5" aria-live="polite"><p className="text-sm font-medium text-[var(--muted)]">Appointment details</p>{selected ? <div className="mt-5 space-y-4"><div><p className="text-sm text-[var(--muted)]">Patient name</p><p className="font-semibold">{selected.patient.name}</p>{selected.patientPhone && <p className="mt-1 text-sm text-[var(--muted)]">{selected.patientPhone}</p>}</div><div><p className="text-sm text-[var(--muted)]">Time</p><p>{formatTime(selected.startsAt)}</p></div><div><p className="text-sm text-[var(--muted)]">Visit details</p><p>{selected.reason}</p>{selected.note && <p className="mt-1 text-sm text-[var(--muted)]">{selected.note}</p>}</div><div><p className="text-sm text-[var(--muted)]">Care team</p><div className="mt-2 flex items-center gap-3">{selected.photo ? <img src={selected.photo} alt="" className="size-10 rounded-full object-cover" /> : <span className="grid size-10 place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{selected.clinician.slice(0, 2).toUpperCase()}</span>}<div><p className="font-medium">{selected.clinician}</p><p className="text-sm text-[var(--muted)]">{selected.specialty}</p></div></div></div><CompletedAppointmentActions appointment={selected} onReview={() => openReview(selected.clinician)} /></div> : <p className="mt-5 text-sm text-[var(--muted)]">Select an appointment to view details.</p>}</aside>
        </div>}
        {deleteCandidate && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" role="presentation" onClick={() => setDeleteCandidate(null)}><div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="delete-appointment-title" onClick={(event) => event.stopPropagation()}><h2 id="delete-appointment-title" className="text-lg font-semibold">Delete appointment?</h2><p className="mt-2 text-sm text-[var(--muted)]">This will remove the appointment from your schedule. This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleteCandidate(null)} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">Keep appointment</button><button type="button" onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete appointment</button></div></div></div>}
        {reviewDoctor && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" role="presentation" onClick={() => setReviewDoctor(null)}><form className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="review-doctor-title" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); setReviewSubmitted(true); }}><h2 id="review-doctor-title" className="text-lg font-semibold">Review {reviewDoctor}</h2>{reviewSubmitted ? <><p className="mt-3 text-sm text-emerald-700">Thank you for sharing your feedback.</p><button className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => setReviewDoctor(null)}>Done</button></> : <><label className="mt-4 block text-sm font-medium">Rating<select className="mt-1.5 block w-full rounded-lg border border-[var(--line)] px-3 py-2" value={reviewRating} onChange={(event) => setReviewRating(event.target.value)}>{[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}</select></label><label className="mt-4 block text-sm font-medium">Comment<textarea className="mt-1.5 min-h-24 w-full rounded-lg border border-[var(--line)] px-3 py-2" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} /></label><div className="mt-5 flex justify-end gap-3"><button className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold" type="button" onClick={() => setReviewDoctor(null)}>Cancel</button><button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white" type="submit">Submit review</button></div></>}</form></div>}
      </div>
    </main>
  );
}

function CompletedAppointmentActions({ appointment, onReview }: { appointment: ScheduleAppointment; onReview: () => void }) {
  if (appointment.status !== "completed") return null;
  const prescriptionAvailable = Boolean(appointment.prescriptionUrl);
  const buttonClass = "rounded-lg border border-[var(--line)] px-3 py-2 text-center text-sm font-semibold text-sky-700 hover:border-sky-300 hover:bg-sky-50";
  const disabledClass = "cursor-not-allowed rounded-lg border border-[var(--line)] px-3 py-2 text-center text-sm font-semibold text-[var(--muted)] opacity-60";
  return <section className="border-t border-[var(--line)] pt-4" aria-label="Completed appointment actions"><p className={`text-sm font-semibold ${prescriptionAvailable ? "text-emerald-700" : "text-[var(--muted)]"}`}>{prescriptionAvailable ? "Prescription Available" : "Prescription Not Available"}</p><div className="mt-3 grid gap-2"><>{prescriptionAvailable ? <a className={buttonClass} href={appointment.prescriptionUrl} target="_blank" rel="noreferrer">View Prescription</a> : <button className={disabledClass} type="button" disabled>View Prescription</button>}</><>{prescriptionAvailable ? <a className={buttonClass} href={appointment.prescriptionUrl} download>Download Prescription PDF</a> : <button className={disabledClass} type="button" disabled>Download Prescription PDF</button>}</><button className={buttonClass} type="button" onClick={onReview}>Review Doctor</button><Link className={buttonClass} href="/doctors">Rebook Appointment</Link></div></section>;
}
