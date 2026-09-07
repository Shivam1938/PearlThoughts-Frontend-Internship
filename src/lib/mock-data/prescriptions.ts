import type { Prescription } from "@/types/prescription";

export const prescriptions: Prescription[] = [
  {
    id: "rx-apt-completed",
    appointmentId: "apt-completed",
    doctorId: "doctor-1",
    doctorName: "Dr. Priya Mehta",
    patientId: "user-001",
    patientName: "Alex Morgan",
    diagnosis: "Seasonal allergic rhinitis",
    medicines: [
      { id: "med-1", name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "7 days" },
      { id: "med-2", name: "Fluticasone nasal spray", dosage: "2 sprays/nostril", frequency: "Once daily", duration: "14 days" },
    ],
    instructions: "Avoid dust exposure. Drink plenty of fluids. Return if symptoms persist beyond 2 weeks.",
    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z",
  },
];
