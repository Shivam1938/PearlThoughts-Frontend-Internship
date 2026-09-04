import type { BookedAppointment } from "@/features/booking/types";

const BOOKINGS_KEY = "pulsecare.booked-appointments";

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

export function saveBookedAppointment(appointment: BookedAppointment): void {
  const stored = window.localStorage.getItem(BOOKINGS_KEY);
  const appointments = stored ? parseAppointments(stored) : [];
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify([appointment, ...appointments]));
}

export function deleteBookedAppointment(userId: string, id: string): void {
  const stored = window.localStorage.getItem(BOOKINGS_KEY);
  const appointments = (stored ? parseAppointments(stored) : []).filter(
    (appointment) => appointment.userId !== userId || appointment.id !== id,
  );
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(appointments));
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
    (appointment.status === "pending" || appointment.status === "confirmed" || appointment.status === "cancelled")
  );
}
