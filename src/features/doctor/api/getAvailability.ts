export type CalendarAvailabilitySlot = {
  doctorId: string;
  start: string;
  end: string;
  isBooked: boolean;
};

export async function getDoctorAvailability(doctorId: string): Promise<CalendarAvailabilitySlot[]> {
  const response = await fetch(`/api/availability?doctorId=${encodeURIComponent(doctorId)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load availability.");
  const body = await response.json() as { data: CalendarAvailabilitySlot[] };
  return body.data;
}
