import type { DoctorLoginRequest, DoctorLoginResponse } from "@/features/doctor/types";

type LoginErrorResponse = { error: string };

function isLoginResponse(value: unknown): value is DoctorLoginResponse {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  return typeof response.token === "string" && typeof response.doctor === "object" && response.doctor !== null && typeof (response.doctor as Record<string, unknown>).id === "string";
}

export async function loginDoctor(email: string, password: string): Promise<DoctorLoginResponse> {
  const request: DoctorLoginRequest = { email, password };
  const response = await fetch("/api/doctor/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
  const body: unknown = await response.json();

  if (!response.ok) {
    if (typeof body === "object" && body !== null && typeof (body as LoginErrorResponse).error === "string") throw new Error((body as LoginErrorResponse).error);
    throw new Error("Unable to log in to the Doctor Portal");
  }
  if (!isLoginResponse(body)) throw new Error("Login response was invalid");
  return body;
}
