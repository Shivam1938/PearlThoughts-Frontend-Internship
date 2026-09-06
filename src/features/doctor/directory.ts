import type { DoctorUser } from "@/features/doctor/types";
import type { Doctor } from "@/types/doctor";

const DIRECTORY_KEY = "pulsecare.doctor-directory";

function isDoctor(value: unknown): value is Doctor {
  if (typeof value !== "object" || value === null) return false;
  const doctor = value as Record<string, unknown>;
  return typeof doctor.id === "string" && typeof doctor.name === "string" && typeof doctor.specialty === "string" && typeof doctor.city === "string" && typeof doctor.photo === "string";
}

export function loadDirectoryDoctors(): Doctor[] { try { const parsed: unknown = JSON.parse(window.localStorage.getItem(DIRECTORY_KEY) ?? "[]"); return Array.isArray(parsed) ? parsed.filter(isDoctor) : []; } catch { return []; } }
export function saveDirectoryDoctor(doctor: DoctorUser): void {
  const directoryDoctor: Doctor = { id: doctor.id, name: doctor.name, specialty: doctor.specialization, city: doctor.clinicAddress.split(",").pop()?.trim() || "Your clinic", photo: doctor.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80", age: doctor.age, rating: 0, fee: 500, experience: doctor.experienceYears, patientSatisfaction: 0, reviewCount: 0 };
  const current = loadDirectoryDoctors().filter((item) => item.id !== doctor.id);
  window.localStorage.setItem(DIRECTORY_KEY, JSON.stringify([...current, directoryDoctor]));
}
