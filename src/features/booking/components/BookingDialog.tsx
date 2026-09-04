"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getSlots } from "@/features/booking/api/getSlots";
import { saveBookedAppointment } from "@/features/booking/storage";
import { useAuth } from "@/features/auth/hooks/auth-context";
import type { Doctor } from "@/types/doctor";
import type { Slot } from "@/types/slot";

type BookingDialogProps = {
  doctor: Doctor;
  onClose: () => void;
};

type BookingStep = "slot" | "review" | "confirmed";
const bookingStartDate = "2026-09-04";
const visitTypes = ["Follow-up consultation", "Annual wellness visit", "New symptoms", "Prescription review", "Specialist consultation"];

export default function BookingDialog({ doctor, onClose }: BookingDialogProps) {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientName, setPatientName] = useState(user?.name ?? "");
  const [patientPhone, setPatientPhone] = useState("");
  const [visitType, setVisitType] = useState(visitTypes[0]);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<BookingStep>("slot");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getSlots(doctor.id)
      .then((nextSlots) => {
        if (!isActive) return;
        setError(null);
        setSlots(nextSlots);
        setSelectedDate(bookingStartDate);
        setIsLoading(false);
      })
      .catch((nextError: unknown) => {
        if (!isActive) return;
        setError(nextError instanceof Error ? nextError.message : "Unable to load available slots");
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [doctor.id]);

  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(`${bookingStartDate}T00:00:00`);
      date.setDate(date.getDate() + index);
      const value = date.toISOString().slice(0, 10);
      const daySlots = slots.filter((slot) => slot.date === value);

      return {
        date: value,
        dateLabel:
          index === 0
            ? "Today"
            : index === 1
              ? "Tomorrow"
              : date.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }),
        slotCount: daySlots.length,
      };
    });
  }, [slots]);
  const visibleSlots = slots.filter((slot) => slot.date === selectedDate);
  const firstDate = dates[0]?.date;
  const lastDate = dates[dates.length - 1]?.date;

  function handleSelectSlot(slot: Slot): void {
    setSelectedSlot(slot);
  }

  function handleContinue(): void {
    if (selectedSlot && patientName.trim() && patientPhone.trim()) setStep("review");
  }

  function handleConfirm(): void {
    const trimmedPatientName = patientName.trim();
    const trimmedPatientPhone = patientPhone.trim();
    if (!user?.id || !selectedSlot || !trimmedPatientName || !trimmedPatientPhone) return;

    saveBookedAppointment({
      id: `booking-${Date.now()}`,
      userId: user.id,
      patientName: trimmedPatientName,
      patientPhone: trimmedPatientPhone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      city: doctor.city,
      photo: doctor.photo,
      date: selectedSlot.date,
      dateLabel: selectedSlot.dateLabel,
      time: selectedSlot.time,
      fee: doctor.fee,
      visitType,
      note: note.trim(),
      status: "pending",
    });
    setStep("confirmed");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="scrollbar-hidden max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-sky-100 bg-white p-5 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Book an appointment</p>
            <h2 id="booking-title" className="mt-2 text-2xl font-semibold text-slate-950">{doctor.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{doctor.specialty} · {doctor.city}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close booking dialog">×</button>
        </div>

        {step === "confirmed" ? (
          <div className="booking-confirmation-card mt-8 rounded-2xl bg-sky-50 p-6 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-sky-600 text-2xl text-white">✓</div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">Appointment confirmed</h3>
            <p className="mt-2 text-sm text-slate-600">Your visit with {doctor.name} is booked for {selectedSlot?.dateLabel} at {selectedSlot?.time}.</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">Done</button>
          </div>
        ) : step === "review" && selectedSlot ? (
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-600">Review details</p>
            <div className="booking-review-card mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-5">
              <div className="flex justify-between gap-4"><span className="text-sm text-slate-500">Doctor</span><span className="text-right text-sm font-semibold text-slate-900">{doctor.name}</span></div>
              <div className="mt-3 flex justify-between gap-4"><span className="text-sm text-slate-500">Appointment</span><span className="text-right text-sm font-semibold text-slate-900">{selectedSlot.dateLabel} · {selectedSlot.time}</span></div>
              <div className="mt-3 flex justify-between gap-4"><span className="text-sm text-slate-500">Consultation fee</span><span className="text-right text-sm font-semibold text-slate-900">₹{doctor.fee}</span></div>
              <div className="mt-3 flex justify-between gap-4"><span className="text-sm text-slate-500">Visit details</span><span className="max-w-[65%] text-right text-sm font-semibold text-slate-900">{visitType}</span></div>
                {note.trim() && <div className="mt-3 flex justify-between gap-4"><span className="text-sm text-slate-500">Your note</span><span className="max-w-[65%] text-right text-sm font-semibold text-slate-900">{note.trim()}</span></div>}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setStep("slot")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Change slot</button>
              <button type="button" onClick={handleConfirm} className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">Confirm appointment</button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-900">Choose a date</p>
            {isLoading ? <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Loading available slots...</p> : error ? <p className="mt-5 rounded-2xl bg-red-50 p-5 text-sm text-red-700" role="alert">{error}</p> : slots.length === 0 ? <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No slots are available for this doctor.</p> : <>
              <div className="date-rail mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Available appointment dates">
                {dates.map((date) => <button key={date.date} type="button" onClick={() => { setSelectedDate(date.date); setSelectedSlot(null); }} className={`min-w-32 shrink-0 rounded-xl border px-3 py-3 text-left ${selectedDate === date.date ? "border-sky-600 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-700 hover:border-sky-300"}`}><span className="block text-xs font-medium">{date.dateLabel}</span><span className="mt-1 block text-xs text-slate-500">{new Date(`${date.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span><span className={`mt-2 block text-xs font-semibold ${date.slotCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>{date.slotCount > 0 ? `${date.slotCount} slots available` : "No slots available"}</span></button>)}
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700" htmlFor="booking-date-picker">
                <CalendarDays className="size-4 text-sky-600" aria-hidden="true" />
                <span>Choose from calendar</span>
                <input id="booking-date-picker" className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100" type="date" value={selectedDate} min={firstDate} max={lastDate} onChange={(event) => { setSelectedDate(event.target.value); setSelectedSlot(null); }} aria-label="Choose appointment date" />
              </label>
              <p className="mt-6 text-sm font-semibold text-slate-900">Available times</p>
              {visibleSlots.length === 0 ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No slots are available on this day. Choose another date.</p> : <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {visibleSlots.map((slot) => <button key={slot.id} type="button" onClick={() => handleSelectSlot(slot)} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${selectedSlot?.id === slot.id ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50"}`}>{slot.time}</button>)}
              </div>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-900" htmlFor="booking-patient-name">
                  Patient name
                  <input id="booking-patient-name" value={patientName} onChange={(event) => setPatientName(event.target.value)} autoComplete="name" placeholder="Enter patient name" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100" />
                </label>
                <label className="block text-sm font-semibold text-slate-900" htmlFor="booking-patient-phone">
                  Phone number
                  <input id="booking-patient-phone" value={patientPhone} onChange={(event) => setPatientPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="Enter phone number" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100" />
                </label>
              </div>
              <label className="mt-6 block text-sm font-semibold text-slate-900" htmlFor="booking-visit-type">
                Visit details
                <select id="booking-visit-type" value={visitType} onChange={(event) => setVisitType(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100">
                  {visitTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="mt-4 block text-sm font-semibold text-slate-900" htmlFor="booking-note">
                What is this appointment for?
                <textarea id="booking-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={240} rows={3} placeholder="Add a short note for your visit" className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100" />
              </label>
              <button type="button" disabled={!selectedSlot} onClick={handleContinue} className="mt-7 w-full rounded-xl bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Continue to review</button>
            </>}
          </div>
        )}
      </section>
    </div>
  );
}
