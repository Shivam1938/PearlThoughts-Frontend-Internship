import type { Prescription, PrescriptionFormValues } from "@/types/prescription";

async function parsePrescriptionResponse(response: Response): Promise<Prescription> {
  const body = await response.json() as { data?: Prescription; message?: string };
  if (!response.ok || !body.data) throw new Error(body.message ?? "Unable to save the prescription.");
  return body.data;
}

export async function createPrescription(doctorId: string, appointmentId: string, values: PrescriptionFormValues): Promise<Prescription> {
  const response = await fetch("/api/prescriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, appointmentId, ...values }),
  });
  return parsePrescriptionResponse(response);
}

export async function updatePrescription(doctorId: string, prescriptionId: string, values: PrescriptionFormValues): Promise<Prescription> {
  const response = await fetch(`/api/prescriptions?id=${encodeURIComponent(prescriptionId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, ...values }),
  });
  return parsePrescriptionResponse(response);
}
