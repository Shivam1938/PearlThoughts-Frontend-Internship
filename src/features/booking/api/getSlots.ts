import type { Slot } from "@/types/slot";
import { loadDoctorAvailability } from "@/features/doctor/availability";
import { getDoctorAppointments } from "@/features/doctor/api/getAppointments";

type SlotsResponse = {
  data: Slot[];
};

export type SlotAvailabilitySummary = {
  total: number;
  booked: number;
  available: number;
};

function isSlotsResponse(value: unknown): value is SlotsResponse {
  return typeof value === "object" && value !== null && Array.isArray((value as { data?: unknown }).data);
}

// Bug 9: the doctor's own appointments (booked through either the managed-availability
// flow or, previously, a duplicate slot) are the one source of truth for "is this time
// actually taken". We cross-check against them below so a slot that still *looks*
// available in the doctor's slot list never gets shown to a patient as bookable.
async function loadBookedTimeKeys(doctorId: string): Promise<Set<string>> {
  try {
    const appointments = await getDoctorAppointments(doctorId);
    return new Set(
      appointments
        .filter((appointment) => appointment.status !== "cancelled")
        .map((appointment) => appointment.dateTime ?? appointment.startsAt),
    );
  } catch {
    return new Set();
  }
}

export async function getSlots(doctorId: string): Promise<Slot[]> {
  const managedSlots = loadDoctorAvailability(doctorId);
  if (managedSlots.length > 0) {
    const bookedTimeKeys = await loadBookedTimeKeys(doctorId);
    const seen = new Set<string>();
    const available: Slot[] = [];
    for (const slot of managedSlots) {
      if (slot.status !== "available") continue;
      const key = `${slot.date}T${slot.startTime}:00`;
      // Skip slots that collide with a real booked appointment, and skip exact
      // duplicates (e.g. the same time accidentally added twice) so a patient
      // never sees the same open time listed more than once.
      if (bookedTimeKeys.has(key) || seen.has(key)) continue;
      seen.add(key);
      available.push({ id: slot.id, doctorId: slot.doctorId, date: slot.date, dateLabel: formatDateLabel(slot.date), time: formatTime(slot.startTime), endTime: formatTime(slot.endTime) });
    }
    return available;
  }

  const response = await fetch(`/api/doctors/${doctorId}/slots`, { cache: "no-store" });
  const body: unknown = await response.json();

  if (!response.ok) throw new Error("Unable to load available slots");
  if (!isSlotsResponse(body)) throw new Error("Slot data was invalid");

  const bookedTimeKeys = await loadBookedTimeKeys(doctorId);
  const seen = new Set<string>();
  const available: Slot[] = [];
  for (const slot of body.data) {
    const key = `${slot.date}T${to24HourTime(slot.time)}`;
    if (bookedTimeKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    available.push(slot);
  }
  return available;
}

// Bug 9: surfaces an accurate "N slots · M booked" summary for the doctor card/listing,
// counting every slot the doctor has (available + booked) rather than only the open ones.
export async function getSlotAvailabilitySummary(doctorId: string): Promise<SlotAvailabilitySummary> {
  const bookedTimeKeys = await loadBookedTimeKeys(doctorId);
  const managedSlots = loadDoctorAvailability(doctorId);

  if (managedSlots.length > 0) {
    const seen = new Set<string>();
    let total = 0;
    let booked = 0;
    for (const slot of managedSlots) {
      const key = `${slot.date}T${slot.startTime}:00`;
      if (seen.has(key)) continue;
      seen.add(key);
      total += 1;
      if (slot.status === "booked" || bookedTimeKeys.has(key)) booked += 1;
    }
    return { total, booked, available: total - booked };
  }

  try {
    const response = await fetch(`/api/doctors/${doctorId}/slots`, { cache: "no-store" });
    const body: unknown = await response.json();
    if (!response.ok || !isSlotsResponse(body)) return { total: 0, booked: 0, available: 0 };
    const seen = new Set<string>();
    let total = 0;
    let booked = 0;
    for (const slot of body.data) {
      const key = `${slot.date}T${to24HourTime(slot.time)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      total += 1;
      if (bookedTimeKeys.has(key)) booked += 1;
    }
    return { total, booked, available: total - booked };
  } catch {
    return { total: 0, booked: 0, available: 0 };
  }
}

function to24HourTime(value: string): string {
  const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return value;
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${match[2]}:00`;
}

function formatDateLabel(date: string): string { return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }); }
function formatTime(time: string): string { return new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }); }
