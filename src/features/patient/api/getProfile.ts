import type { PatientProfile } from "@/types/patient";

export async function getPatientProfile(patientId: string): Promise<PatientProfile> {
  const response = await fetch(`/api/patients/profile?id=${encodeURIComponent(patientId)}`, { cache: "no-store" });
  const body = await response.json() as { data?: PatientProfile; message?: string };
  if (!response.ok || !body.data) throw new Error(body.message ?? "Unable to load your profile.");
  return body.data;
}
