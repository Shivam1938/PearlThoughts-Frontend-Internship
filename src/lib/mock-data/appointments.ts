import type { Appointment } from "@/types/appointment";

function appointment(id: string, patientId: string, patientName: string, dateTime: string, type: string, status: Appointment["status"], notes?: string, prescriptionUrl?: string): Appointment {
  return { id, patientId, doctorId: "doctor-1", patient: { name: patientName, initials: patientName.split(" ").map((part) => part[0]).join(""), age: 0 }, clinician: "Dr. Priya Mehta", specialty: "General Medicine", startsAt: dateTime, durationMinutes: 30, status, reason: type, note: notes, dateTime, type, notes, prescriptionUrl };
}

export const appointments: Appointment[] = [
  appointment("apt-pending", "user-001", "Alex Morgan", "2026-09-10T09:00:00.000Z", "Consultation", "pending", "First visit"),
  appointment("apt-confirmed", "user-001", "Alex Morgan", "2026-09-10T10:00:00.000Z", "Follow-up", "confirmed"),
  appointment("apt-upcoming", "user-001", "Alex Morgan", "2026-09-11T11:00:00.000Z", "Consultation", "upcoming", "Discuss test results"),
  appointment("apt-completed", "user-001", "Alex Morgan", "2026-08-30T09:30:00.000Z", "Consultation", "completed", undefined, "/prescriptions/rx-apt-completed"),
  appointment("apt-cancelled", "user-002", "Sam Taylor", "2026-09-03T10:00:00.000Z", "Consultation", "cancelled"),
  appointment("apt-missed", "user-002", "Sam Taylor", "2026-08-28T15:00:00.000Z", "Follow-up", "missed"),
];
