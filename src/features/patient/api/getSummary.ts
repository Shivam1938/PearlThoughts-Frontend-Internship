import { getPatientAppointments } from "@/features/appointments/api/getPatientAppointments";
import type { Prescription } from "@/types/prescription";

export type PatientSummary = { totalPrescriptions: number; completedAppointments: number; testReports: number };

async function getPatientPrescriptionCount(patientId: string): Promise<number> {
  const response = await fetch(`/api/prescriptions?patientId=${encodeURIComponent(patientId)}`, { cache: "no-store" });
  if (!response.ok) return 0;
  const body = await response.json() as { data: Prescription[] };
  return body.data.length;
}

async function getTestReportCount(patientId: string): Promise<number> {
  const response = await fetch(`/api/test-reports?patientId=${encodeURIComponent(patientId)}`, { cache: "no-store" });
  if (!response.ok) return 0;
  const body = await response.json() as { meta: { total: number } };
  return body.meta.total;
}

export async function getPatientSummary(patientId: string): Promise<PatientSummary> {
  const [appointments, totalPrescriptions, testReports] = await Promise.all([
    getPatientAppointments(patientId),
    getPatientPrescriptionCount(patientId),
    getTestReportCount(patientId),
  ]);
  return {
    totalPrescriptions,
    completedAppointments: appointments.filter((appointment) => appointment.status === "completed").length,
    testReports,
  };
}
