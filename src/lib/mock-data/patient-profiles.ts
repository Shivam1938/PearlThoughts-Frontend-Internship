import type { PatientProfile } from "@/types/patient";

export const patientProfiles: PatientProfile[] = [
  {
    id: "user-001",
    name: "Alex Morgan",
    email: "patient@example.com",
    phone: "+91 90000 11111",
    dateOfBirth: "1994-05-12",
    gender: "Female",
    heightCm: 165,
    weightKg: 60,
    bloodGroup: "O+",
    medicalConditions: ["Seasonal allergies"],
    allergies: ["Pollen", "Peanuts"],
    currentMedications: ["Cetirizine 10mg"],
    insuranceProvider: "StarHealth",
    insurancePolicyNumber: "SH-2024-88213",
    emergencyContactName: "Jordan Morgan",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+91 90000 22222",
  },
  {
    id: "user-002",
    name: "Sam Taylor",
    email: "sam@example.com",
    phone: "+91 90000 33333",
    dateOfBirth: "1989-11-02",
    gender: "Male",
    heightCm: 178,
    weightKg: 75,
    bloodGroup: "B+",
    medicalConditions: [],
    allergies: [],
    currentMedications: [],
    insuranceProvider: "",
    insurancePolicyNumber: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
  },
];

export function findOrCreatePatientProfile(patientId: string, name: string, email: string): PatientProfile {
  const existing = patientProfiles.find((profile) => profile.id === patientId);
  if (existing) return existing;
  const created: PatientProfile = {
    id: patientId,
    name,
    email,
    phone: "",
    dateOfBirth: "",
    gender: "",
    heightCm: 0,
    weightKg: 0,
    bloodGroup: "",
    medicalConditions: [],
    allergies: [],
    currentMedications: [],
    insuranceProvider: "",
    insurancePolicyNumber: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
  };
  patientProfiles.push(created);
  return created;
}
