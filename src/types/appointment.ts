export type AppointmentStatus = "pending" | "confirmed" | "upcoming" | "completed" | "cancelled" | "missed";

export type Appointment = {
  id: string;
  patient: { name: string; initials: string; age: number };
  clinician: string;
  specialty: string;
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  photo?: string;
  room?: string;
  note?: string;
  patientPhone?: string;
  patientId?: string;
  doctorId?: string;
  dateTime?: string;
  type?: string;
  notes?: string;
  prescriptionUrl?: string;
};
