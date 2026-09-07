import type { DoctorRegistrationRequest } from "@/features/doctor/types";
import { doctorAccounts } from "@/lib/mock-data/doctor-accounts";
import { users } from "@/lib/mock-data/users";

function isRegistrationBody(value: unknown): value is DoctorRegistrationRequest {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.name === "string" &&
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    typeof body.specialization === "string" &&
    typeof body.qualification === "string" &&
    typeof body.experienceYears === "number" &&
    typeof body.phone === "string" &&
    typeof body.clinicAddress === "string" &&
    typeof body.bio === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!isRegistrationBody(body)) {
    return Response.json({ error: "All doctor registration fields are required" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  if (doctorAccounts.some((doctor) => doctor.email === email) || users.some((user) => user.email === email)) {
    return Response.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const doctor = {
    id: `doctor-${Date.now()}`,
    name: body.name.trim(),
    email,
    password: body.password,
    specialization: body.specialization.trim(),
    qualification: body.qualification.trim(),
    experienceYears: body.experienceYears,
    age: 0,
    phone: body.phone.trim(),
    clinicAddress: body.clinicAddress.trim(),
    bio: body.bio.trim(),
    profileImage: "",
    licenseDocument: "",
  };
  doctorAccounts.push(doctor);

  return Response.json({ doctor: toDoctorUser(doctor) }, { status: 201 });
}

function toDoctorUser(doctor: (typeof doctorAccounts)[number]) {
  return {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    specialization: doctor.specialization,
    qualification: doctor.qualification,
    experienceYears: doctor.experienceYears,
    age: doctor.age,
    phone: doctor.phone,
    clinicAddress: doctor.clinicAddress,
    bio: doctor.bio,
    profileImage: doctor.profileImage,
    licenseDocument: doctor.licenseDocument,
  };
}
