import type { DoctorProfileFields } from "@/features/doctor/types";
import { doctorAccounts } from "@/lib/mock-data/doctor-accounts";

type ProfileRequest = DoctorProfileFields & { id: string };

function isProfileRequest(value: unknown): value is ProfileRequest {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return typeof body.id === "string" && typeof body.name === "string" && typeof body.email === "string" && typeof body.specialization === "string" && typeof body.qualification === "string" && typeof body.experienceYears === "number" && typeof body.phone === "string" && typeof body.clinicAddress === "string" && typeof body.bio === "string" && typeof body.profileImage === "string";
}

export async function PUT(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  if (!isProfileRequest(body)) return Response.json({ error: "All profile fields are required" }, { status: 400 });
  const account = doctorAccounts.find((doctor) => doctor.id === body.id);
  if (!account) return Response.json({ error: "Doctor account was not found" }, { status: 404 });
  const email = body.email.trim().toLowerCase();
  if (doctorAccounts.some((doctor) => doctor.id !== account.id && doctor.email === email)) return Response.json({ error: "An account with this email already exists" }, { status: 409 });
  Object.assign(account, { name: body.name.trim(), email, specialization: body.specialization.trim(), qualification: body.qualification.trim(), experienceYears: body.experienceYears, phone: body.phone.trim(), clinicAddress: body.clinicAddress.trim(), bio: body.bio.trim(), profileImage: body.profileImage.trim() });
  return Response.json({ doctor: { id: account.id, name: account.name, email: account.email, specialization: account.specialization, qualification: account.qualification, experienceYears: account.experienceYears, phone: account.phone, clinicAddress: account.clinicAddress, bio: account.bio, profileImage: account.profileImage } });
}
