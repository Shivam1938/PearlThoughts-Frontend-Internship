import type { Appointment } from "@/types/appointment";

export async function cancelPatientAppointment(patientId: string, appointmentId: string): Promise<Appointment> {
  const response = await fetch(`/api/appointments?id=${encodeURIComponent(appointmentId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId, action: "cancel" }),
  });
  const body = await response.json() as { data?: Appointment; message?: string };
  if (!response.ok || !body.data) throw new Error(body.message ?? "Unable to cancel appointment.");
  return body.data;
}
