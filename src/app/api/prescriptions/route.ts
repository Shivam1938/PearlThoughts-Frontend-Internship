import { appointments } from "@/lib/mock-data/appointments";
import { appointmentNotifications } from "@/lib/mock-data/notifications";
import { prescriptions } from "@/lib/mock-data/prescriptions";
import type { Medicine, Prescription } from "@/types/prescription";

type MedicineInput = { name?: string; dosage?: string; frequency?: string; duration?: string };
type CreatePrescriptionRequest = { doctorId?: string; appointmentId?: string; diagnosis?: string; medicines?: MedicineInput[]; instructions?: string };
type UpdatePrescriptionRequest = { doctorId?: string; diagnosis?: string; medicines?: MedicineInput[]; instructions?: string };

function normalizeMedicines(input: MedicineInput[]): Medicine[] {
  return input
    .filter((medicine) => medicine.name?.trim())
    .map((medicine, index) => ({
      id: `med-${Date.now()}-${index}`,
      name: medicine.name!.trim(),
      dosage: medicine.dosage?.trim() ?? "",
      frequency: medicine.frequency?.trim() ?? "",
      duration: medicine.duration?.trim() ?? "",
    }));
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");
  const appointmentId = searchParams.get("appointmentId");
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const data = prescriptions.filter((prescription) =>
    (!id || prescription.id === id)
    && (!appointmentId || prescription.appointmentId === appointmentId)
    && (!doctorId || prescription.doctorId === doctorId)
    && (!patientId || prescription.patientId === patientId),
  );
  return Response.json({ data, meta: { total: data.length } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as CreatePrescriptionRequest | null;
  if (!body?.doctorId || !body.appointmentId || !body.diagnosis?.trim() || !body.medicines?.length) {
    return Response.json({ message: "A diagnosis, at least one medicine, and the appointment are required." }, { status: 400 });
  }

  const appointment = appointments.find((item) => item.id === body.appointmentId && item.doctorId === body.doctorId);
  if (!appointment) return Response.json({ message: "Appointment not found." }, { status: 404 });
  if (appointment.status !== "completed") return Response.json({ message: "Prescriptions can only be created for completed appointments." }, { status: 409 });
  if (prescriptions.some((item) => item.appointmentId === appointment.id)) {
    return Response.json({ message: "A prescription already exists for this appointment. Edit it instead." }, { status: 409 });
  }

  const medicines = normalizeMedicines(body.medicines);
  if (!medicines.length) return Response.json({ message: "At least one medicine name is required." }, { status: 400 });

  const now = new Date().toISOString();
  const prescription: Prescription = {
    id: `rx-${Date.now()}`,
    appointmentId: appointment.id,
    doctorId: appointment.doctorId ?? body.doctorId,
    doctorName: appointment.clinician,
    patientId: appointment.patientId ?? "",
    patientName: appointment.patient.name,
    diagnosis: body.diagnosis.trim(),
    medicines,
    instructions: body.instructions?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };
  prescriptions.unshift(prescription);
  appointment.prescriptionUrl = `/prescriptions/${prescription.id}`;

  if (appointment.patientId) {
    appointmentNotifications.unshift({
      id: `notification-prescription-${Date.now()}`,
      appointmentId: appointment.id,
      recipientId: appointment.patientId,
      kind: "prescription_available",
      message: "Your prescription is available.",
      createdAt: now,
      read: false,
    });
  }

  return Response.json({ data: prescription }, { status: 201 });
}

export async function PATCH(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  const body = await request.json().catch(() => null) as UpdatePrescriptionRequest | null;
  if (!body?.doctorId || !body.diagnosis?.trim() || !body.medicines?.length) {
    return Response.json({ message: "A diagnosis and at least one medicine are required." }, { status: 400 });
  }

  const prescription = prescriptions.find((item) => item.id === id && item.doctorId === body.doctorId);
  if (!prescription) return Response.json({ message: "Prescription not found." }, { status: 404 });

  const medicines = normalizeMedicines(body.medicines);
  if (!medicines.length) return Response.json({ message: "At least one medicine name is required." }, { status: 400 });

  prescription.diagnosis = body.diagnosis.trim();
  prescription.medicines = medicines;
  prescription.instructions = body.instructions?.trim() ?? "";
  prescription.updatedAt = new Date().toISOString();

  return Response.json({ data: prescription });
}
