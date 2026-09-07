import type { PatientProfile } from "@/types/patient";

export async function updatePatientProfile(profile: PatientProfile): Promise<PatientProfile> {
  const response = await fetch("/api/patients/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
  const body = await response.json() as { data?: PatientProfile; message?: string };
  if (!response.ok || !body.data) throw new Error(body.message ?? "Unable to save your profile.");
  return body.data;
}
