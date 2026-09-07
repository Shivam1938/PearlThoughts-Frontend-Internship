import type { DoctorUser } from "@/features/doctor/types";

export type DoctorSession = {
  doctor: DoctorUser;
  token: string;
};

const SESSION_KEY = "pulsecara.doctor.session";

function isDoctorSession(value: unknown): value is DoctorSession {
  if (typeof value !== "object" || value === null) return false;
  const session = value as Record<string, unknown>;
  const doctor = session.doctor;
  return typeof session.token === "string" && typeof doctor === "object" && doctor !== null && typeof (doctor as Record<string, unknown>).id === "string" && typeof (doctor as Record<string, unknown>).email === "string" && typeof (doctor as Record<string, unknown>).name === "string";
}

export function saveDoctorSession(session: DoctorSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadDoctorSession(): DoctorSession | null {
  const storedSession = window.localStorage.getItem(SESSION_KEY);
  if (!storedSession) return null;

  try {
    const session: unknown = JSON.parse(storedSession);
    if (isDoctorSession(session)) return session;
  } catch {
    // Invalid session data is cleared below.
  }
  clearDoctorSession();
  return null;
}

export function clearDoctorSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
