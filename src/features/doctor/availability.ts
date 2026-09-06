import type { DoctorAvailabilitySlot } from "@/features/doctor/types";

const SLOTS_KEY = "pulsecare.doctor-availability";

function isSlot(value: unknown): value is DoctorAvailabilitySlot {
  if (typeof value !== "object" || value === null) return false;
  const slot = value as Record<string, unknown>;
  return typeof slot.id === "string" && typeof slot.doctorId === "string" && typeof slot.date === "string" && typeof slot.startTime === "string" && typeof slot.endTime === "string" && typeof slot.isRecurring === "boolean" && (slot.status === "available" || slot.status === "booked");
}

function loadAllSlots(): DoctorAvailabilitySlot[] {
  try {
    const stored = window.localStorage.getItem(SLOTS_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter(isSlot) : [];
  } catch { return []; }
}

export function loadDoctorAvailability(doctorId: string): DoctorAvailabilitySlot[] {
  return loadAllSlots().filter((slot) => slot.doctorId === doctorId).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}

export function saveDoctorAvailability(slots: DoctorAvailabilitySlot[]): void {
  const allSlots = loadAllSlots();
  const doctorId = slots[0]?.doctorId;
  const remaining = doctorId ? allSlots.filter((slot) => slot.doctorId !== doctorId) : allSlots;
  window.localStorage.setItem(SLOTS_KEY, JSON.stringify([...remaining, ...slots]));
}

export function removeDoctorAvailabilitySlot(doctorId: string, slotId: string): void {
  window.localStorage.setItem(SLOTS_KEY, JSON.stringify(loadAllSlots().filter((slot) => slot.doctorId !== doctorId || slot.id !== slotId)));
}

export function markDoctorAvailabilitySlotBooked(doctorId: string, slotId: string, appointmentId: string): boolean {
  const slots = loadAllSlots();
  const slot = slots.find((item) => item.doctorId === doctorId && item.id === slotId && item.status === "available");
  if (!slot) return false;
  slot.status = "booked";
  slot.appointmentId = appointmentId;
  window.localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  return true;
}

export function loadAvailableDoctorSlots(doctorId: string): DoctorAvailabilitySlot[] { return loadDoctorAvailability(doctorId).filter((slot) => slot.status === "available"); }
