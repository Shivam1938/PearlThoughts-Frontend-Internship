import type { Slot } from "@/types/slot";
import { loadAvailableDoctorSlots } from "@/features/doctor/availability";

type SlotsResponse = {
  data: Slot[];
};

function isSlotsResponse(value: unknown): value is SlotsResponse {
  return typeof value === "object" && value !== null && Array.isArray((value as { data?: unknown }).data);
}

export async function getSlots(doctorId: string): Promise<Slot[]> {
  const managedSlots = loadAvailableDoctorSlots(doctorId).map((slot) => ({ id: slot.id, doctorId: slot.doctorId, date: slot.date, dateLabel: formatDateLabel(slot.date), time: formatTime(slot.startTime), endTime: formatTime(slot.endTime) }));
  if (managedSlots.length > 0) return managedSlots;
  const response = await fetch(`/api/doctors/${doctorId}/slots`, { cache: "no-store" });
  const body: unknown = await response.json();

  if (!response.ok) throw new Error("Unable to load available slots");
  if (!isSlotsResponse(body)) throw new Error("Slot data was invalid");

  return body.data;
}

function formatDateLabel(date: string): string { return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }); }
function formatTime(time: string): string { return new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); }
