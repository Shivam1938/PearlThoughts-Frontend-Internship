import type { Appointment } from "@/types/appointment";

export type CreateAppointmentRequest = {
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  photo?: string;
  startsAt: string;
  type: string;
  notes?: string;
};

export async function createAppointment(appointment: CreateAppointmentRequest): Promise<Appointment> {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
  const body = await response.json() as { data?: Appointment; message?: string };
  if (!response.ok || !body.data) throw new Error(body.message ?? "Unable to book the appointment.");
  return body.data;
}
