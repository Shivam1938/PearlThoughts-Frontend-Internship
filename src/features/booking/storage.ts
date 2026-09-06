import type { BookedAppointment } from "@/features/booking/types";
import { releaseDoctorAvailabilitySlot } from "@/features/doctor/availability";

const BOOKINGS_KEY = "pulsecare.booked-appointments";
const BOOKINGS_CHANGED_EVENT = "pulsecare:bookings-changed";

export function loadBookedAppointments(userId: string): BookedAppointment[] {
  const stored = window.localStorage.getItem(BOOKINGS_KEY);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBookedAppointment).filter((appointment) => appointment.userId === userId);
  } catch {
    return [];
  }
}

export function loadDoctorAppointments(doctorId: string): BookedAppointment[] {
  const stored = window.localStorage.getItem(BOOKINGS_KEY);
  if (!stored) return [];
  return parseAppointments(stored).filter((appointment) => appointment.doctorId === doctorId && !appointment.doctorDeleted);
}

export function saveBookedAppointment(appointment: BookedAppointment): void {
  const stored = window.localStorage.getItem(BOOKINGS_KEY);
  const appointments = stored ? parseAppointments(stored) : [];
  writeAppointments([appointment, ...appointments]);
}

export function deleteBookedAppointment(userId: string, id: string): void {
  const stored = window.localStorage.getItem(BOOKINGS_KEY);
  const appointments = (stored ? parseAppointments(stored) : []).filter(
    (appointment) => appointment.userId !== userId || appointment.id !== id,
  );
  writeAppointments(appointments);
}

export function updateDoctorAppointmentStatus(doctorId: string, id: string, status: "confirmed" | "cancelled"): boolean {
  const appointments = parseAppointments(window.localStorage.getItem(BOOKINGS_KEY) ?? "");
  const appointment = appointments.find((item) => item.id === id && item.doctorId === doctorId && item.status === "pending");
  if (!appointment) return false;
  appointment.status = status;
  if (status === "cancelled" && appointment.slotId) releaseDoctorAvailabilitySlot(doctorId, appointment.slotId);
  writeAppointments(appointments);
  return true;
}

export function hideDoctorAppointment(doctorId: string, id: string): boolean {
  const appointments = parseAppointments(window.localStorage.getItem(BOOKINGS_KEY) ?? "");
  const appointment = appointments.find((item) => item.id === id && item.doctorId === doctorId && item.status !== "pending");
  if (!appointment) return false;
  appointment.doctorDeleted = true;
  writeAppointments(appointments);
  return true;
}

export function subscribeToBookingChanges(listener: () => void): () => void {
  const handleStorage = (event: StorageEvent) => { if (event.key === BOOKINGS_KEY) listener(); };
  window.addEventListener(BOOKINGS_CHANGED_EVENT, listener);
  window.addEventListener("storage", handleStorage);
  return () => { window.removeEventListener(BOOKINGS_CHANGED_EVENT, listener); window.removeEventListener("storage", handleStorage); };
}

function writeAppointments(appointments: BookedAppointment[]): void {
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(appointments));
  window.dispatchEvent(new Event(BOOKINGS_CHANGED_EVENT));
}

function parseAppointments(stored: string): BookedAppointment[] {
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isBookedAppointment) : [];
  } catch {
    return [];
  }
}

function isBookedAppointment(value: unknown): value is BookedAppointment {
  if (typeof value !== "object" || value === null) return false;
  const appointment = value as Record<string, unknown>;
  return (
    typeof appointment.id === "string" &&
    typeof appointment.userId === "string" &&
    typeof appointment.patientName === "string" &&
    typeof appointment.patientPhone === "string" &&
    typeof appointment.doctorId === "string" &&
    (typeof appointment.slotId === "undefined" || typeof appointment.slotId === "string") &&
    typeof appointment.doctorName === "string" &&
    typeof appointment.specialty === "string" &&
    typeof appointment.city === "string" &&
    typeof appointment.photo === "string" &&
    typeof appointment.date === "string" &&
    typeof appointment.dateLabel === "string" &&
    typeof appointment.time === "string" &&
    typeof appointment.fee === "number" &&
    typeof appointment.visitType === "string" &&
    (typeof appointment.note === "undefined" || typeof appointment.note === "string") &&
    (typeof appointment.doctorDeleted === "undefined" || typeof appointment.doctorDeleted === "boolean") &&
    (appointment.status === "pending" || appointment.status === "confirmed" || appointment.status === "cancelled")
  );
}
