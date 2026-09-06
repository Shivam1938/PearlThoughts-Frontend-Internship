import type { Appointment } from "@/types/appointment";

export type AppointmentAction = "confirm" | "decline" | "cancel" | "complete" | "miss" | "reschedule";

export async function updateDoctorAppointment(doctorId: string, appointmentId: string, action: AppointmentAction, startsAt?: string): Promise<Appointment> {
  const response = await fetch(`/api/appointments?id=${encodeURIComponent(appointmentId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doctorId, action, startsAt }) });
  const body = await response.json() as { data?: Appointment; message?: string };
  if (!response.ok || !body.data) throw new Error(body.message ?? "Unable to update appointment.");
  return body.data;
}
