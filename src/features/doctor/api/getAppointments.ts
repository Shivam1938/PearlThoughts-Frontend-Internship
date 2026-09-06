import type { Appointment, AppointmentStatus } from "@/types/appointment";

export async function getDoctorAppointments(doctorId: string, status?: AppointmentStatus): Promise<Appointment[]> {
  const searchParams = new URLSearchParams({ doctorId });
  if (status) searchParams.set("status", status);

  const response = await fetch(`/api/appointments?${searchParams.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load appointments.");

  const body = await response.json() as { data: Appointment[] };
  return body.data;
}
