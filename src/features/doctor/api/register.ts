import type { DoctorRegistrationRequest, DoctorRegistrationResponse } from "@/features/doctor/types";

type RegistrationErrorResponse = { error: string };

function isRegistrationResponse(value: unknown): value is DoctorRegistrationResponse {
  if (typeof value !== "object" || value === null) return false;
  const doctor = (value as Record<string, unknown>).doctor;
  return typeof doctor === "object" && doctor !== null && typeof (doctor as Record<string, unknown>).id === "string";
}

function isRegistrationErrorResponse(value: unknown): value is RegistrationErrorResponse {
  return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>).error === "string";
}

export async function registerDoctor(request: DoctorRegistrationRequest): Promise<DoctorRegistrationResponse> {
  const response = await fetch("/api/doctor/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body: unknown = await response.json();

  if (!response.ok) {
    if (isRegistrationErrorResponse(body)) throw new Error(body.error);
    throw new Error("Unable to create your doctor account");
  }
  if (!isRegistrationResponse(body)) throw new Error("Registration response was invalid");
  return body;
}
