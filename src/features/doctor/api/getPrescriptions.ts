import type { Prescription } from "@/types/prescription";

export async function getDoctorPrescriptions(doctorId: string): Promise<Prescription[]> {
  const response = await fetch(`/api/prescriptions?doctorId=${encodeURIComponent(doctorId)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load prescriptions.");
  const body = await response.json() as { data: Prescription[] };
  return body.data;
}
