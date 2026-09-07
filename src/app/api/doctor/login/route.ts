import { doctorAccounts } from "@/lib/mock-data/doctor-accounts";

type LoginBody = { email?: unknown; password?: unknown };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || typeof (body as LoginBody).email !== "string" || typeof (body as LoginBody).password !== "string") {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { email, password } = body as { email: string; password: string };
  const normalizedEmail = email.trim().toLowerCase();
  const doctor = doctorAccounts.find((candidate) => candidate.email === normalizedEmail && candidate.password === password);

  if (!doctor && !doctorAccounts.some((candidate) => candidate.email === normalizedEmail)) {
    return Response.json({ error: "No doctor account found. Please register first." }, { status: 404 });
  }
  if (!doctor) return Response.json({ error: "Invalid email or password" }, { status: 401 });

  return Response.json({ doctor: toDoctorUser(doctor), token: `demo-doctor-token-${doctor.id}` });
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
