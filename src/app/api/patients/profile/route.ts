import { users } from "@/lib/mock-data/users";
import { findOrCreatePatientProfile, patientProfiles } from "@/lib/mock-data/patient-profiles";
import type { PatientProfileFields } from "@/types/patient";

type ProfileUpdateRequest = PatientProfileFields & { id?: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isProfileUpdateRequest(value: unknown): value is ProfileUpdateRequest {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.id === "string"
    && typeof body.name === "string"
    && typeof body.email === "string"
    && typeof body.phone === "string"
    && typeof body.dateOfBirth === "string"
    && typeof body.gender === "string"
    && typeof body.heightCm === "number"
    && typeof body.weightKg === "number"
    && typeof body.bloodGroup === "string"
    && isStringArray(body.medicalConditions)
    && isStringArray(body.allergies)
    && isStringArray(body.currentMedications)
    && typeof body.insuranceProvider === "string"
    && typeof body.insurancePolicyNumber === "string"
    && typeof body.emergencyContactName === "string"
    && typeof body.emergencyContactRelation === "string"
    && typeof body.emergencyContactPhone === "string"
  );
}

export async function GET(request: Request) {
  const patientId = new URL(request.url).searchParams.get("id");
  if (!patientId) return Response.json({ message: "A patient ID is required." }, { status: 400 });
  const account = users.find((user) => user.id === patientId);
  const profile = findOrCreatePatientProfile(patientId, account?.name ?? "", account?.email ?? "");
  return Response.json({ data: profile });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null) as unknown;
  if (!isProfileUpdateRequest(body)) return Response.json({ message: "All profile fields are required." }, { status: 400 });

  const existing = patientProfiles.find((profile) => profile.id === body.id);
  if (!existing) return Response.json({ message: "Patient profile not found." }, { status: 404 });

  Object.assign(existing, {
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.trim(),
    dateOfBirth: body.dateOfBirth,
    gender: body.gender.trim(),
    heightCm: body.heightCm,
    weightKg: body.weightKg,
    bloodGroup: body.bloodGroup.trim(),
    medicalConditions: body.medicalConditions.map((item) => item.trim()).filter(Boolean),
    allergies: body.allergies.map((item) => item.trim()).filter(Boolean),
    currentMedications: body.currentMedications.map((item) => item.trim()).filter(Boolean),
    insuranceProvider: body.insuranceProvider.trim(),
    insurancePolicyNumber: body.insurancePolicyNumber.trim(),
    emergencyContactName: body.emergencyContactName.trim(),
    emergencyContactRelation: body.emergencyContactRelation.trim(),
    emergencyContactPhone: body.emergencyContactPhone.trim(),
  });

  return Response.json({ data: existing });
}
