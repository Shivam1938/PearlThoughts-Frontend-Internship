import type { Appointment } from "@/types/appointment";

export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  const response = await fetch(`/api/appointments?patientId=${encodeURIComponent(patientId)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load appointments.");
  const body = await response.json() as { data: Appointment[] };
  return body.data;
}
