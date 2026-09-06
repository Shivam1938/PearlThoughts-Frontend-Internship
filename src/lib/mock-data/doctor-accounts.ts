import type { DoctorAccount } from "@/features/doctor/types";

// Seeded so the "doctor-1" ID referenced by the appointment/availability
// fixtures (src/lib/mock-data/appointments.ts, availability.ts) is actually
// reachable through a real login. Without this, no doctor account could
// ever see that fixture data -- every real registration gets a fresh
// `doctor-${Date.now()}` ID that doesn't match, so the dashboard's
// "Upcoming appointments" (and every other stat) would show 0 no matter
// what, since GET /api/appointments?doctorId=... would never find a match.
export const doctorAccounts: DoctorAccount[] = [
  {
    id: "doctor-1",
    name: "Dr. Priya Mehta",
    email: "priya.mehta@pulsecare.demo",
    password: "Doctor@123",
    specialization: "General Medicine",
    qualification: "MBBS, MD (General Medicine)",
    experienceYears: 12,
    age: 38,
    phone: "+91 98765 43210",
    clinicAddress: "PulseCare Clinic, MG Road, Bengaluru",
    bio: "General physician focused on preventive care and long-term patient relationships.",
    profileImage: "",
    licenseDocument: "",
  },
];
