import type { Prescription } from "@/types/prescription";

export async function getPrescription(id: string): Promise<Prescription | null> {
  const response = await fetch(`/api/prescriptions?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load the prescription.");
  const body = await response.json() as { data: Prescription[] };
  return body.data[0] ?? null;
}
