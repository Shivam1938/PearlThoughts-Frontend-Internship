import { appointments } from "@/lib/mock-data/appointments";
import { availabilitySlots } from "@/lib/mock-data/availability";
import { appointmentNotifications } from "@/lib/mock-data/notifications";
import type { AppointmentStatus } from "@/types/appointment";
import type { NotificationKind } from "@/types/notification";

const appointmentStatuses: AppointmentStatus[] = ["pending", "confirmed", "upcoming", "completed", "cancelled", "missed"];

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const status = searchParams.get("status");
  const data = appointments.filter((appointment) =>
    (!doctorId || appointment.doctorId === doctorId)
    && (!patientId || appointment.patientId === patientId)
    && (!status || !appointmentStatuses.includes(status as AppointmentStatus) || appointment.status === status),
  );
  return Response.json({ data, meta: { total: data.length } });
}

type AppointmentAction = "confirm" | "decline" | "cancel" | "complete" | "miss" | "reschedule";
type UpdateAppointmentRequest = { doctorId?: string; patientId?: string; action?: AppointmentAction; startsAt?: string };
type CreateAppointmentRequest = {
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  photo?: string;
  startsAt?: string;
  type?: string;
  notes?: string;
};
const appointmentActions: AppointmentAction[] = ["confirm", "decline", "cancel", "complete", "miss", "reschedule"];

const notificationsByAction: Record<AppointmentAction, { kind: NotificationKind; message: string }> = {
  confirm: { kind: "booking_confirmed", message: "Your appointment has been confirmed." },
  decline: { kind: "cancelled", message: "Your appointment was declined." },
  cancel: { kind: "cancelled", message: "Your appointment was cancelled." },
  complete: { kind: "completed", message: "Your appointment was completed." },
  miss: { kind: "missed", message: "Your appointment was marked missed." },
  reschedule: { kind: "rescheduled", message: "Your appointment time was rescheduled." },
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as CreateAppointmentRequest | null;
  if (!body?.patientId || !body.patientName || !body.patientPhone || !body.doctorId || !body.doctorName || !body.specialty || !body.startsAt || !body.type) {
    return Response.json({ message: "Complete appointment details are required." }, { status: 400 });
  }
  if (Number.isNaN(new Date(body.startsAt).getTime())) return Response.json({ message: "A valid appointment time is required." }, { status: 400 });

  const hasConflict = appointments.some((appointment) =>
    appointment.doctorId === body.doctorId
    && appointment.status !== "cancelled"
    && (appointment.dateTime ?? appointment.startsAt) === body.startsAt,
  );
  if (hasConflict) return Response.json({ message: "That slot was just booked. Please choose another time." }, { status: 409 });

  const appointment = {
    id: `appointment-${Date.now()}`,
    patientId: body.patientId,
    doctorId: body.doctorId,
    patient: { name: body.patientName, initials: body.patientName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase(), age: 0 },
    patientPhone: body.patientPhone,
    clinician: body.doctorName,
    specialty: body.specialty,
    photo: body.photo,
    startsAt: body.startsAt,
    dateTime: body.startsAt,
    durationMinutes: 30,
    status: "pending" as const,
    reason: body.type,
    type: body.type,
    note: body.notes,
    notes: body.notes,
  };
  appointments.unshift(appointment);
  const createdAt = new Date().toISOString();
  appointmentNotifications.unshift(
    { id: `notification-booking-patient-${Date.now()}`, appointmentId: appointment.id, recipientId: appointment.patientId, kind: "booking_confirmed", message: "Your appointment request was received.", createdAt, read: false },
    { id: `notification-booking-doctor-${Date.now()}`, appointmentId: appointment.id, recipientId: appointment.doctorId, kind: "booking_confirmed", message: `New appointment request from ${appointment.patient.name}.`, createdAt, read: false },
  );
  return Response.json({ data: appointment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null) as UpdateAppointmentRequest | null;
  if (!body?.action || !appointmentActions.includes(body.action) || (!body.doctorId && (!body.patientId || body.action !== "cancel"))) return Response.json({ message: "A valid appointment action and owner ID are required." }, { status: 400 });

  const appointmentId = new URL(request.url).searchParams.get("id");
  const appointment = appointments.find((item) => item.id === appointmentId && (item.doctorId === body.doctorId || (body.action === "cancel" && item.patientId === body.patientId)));
  if (!appointment) return Response.json({ message: "Appointment not found." }, { status: 404 });

  const startsAt = appointment.dateTime ?? appointment.startsAt;
  const isPastDue = new Date(startsAt).getTime() <= Date.now();
  const invalidTransition = (message: string) => Response.json({ message }, { status: 409 });

  if (body.action === "confirm" || body.action === "decline") {
    if (appointment.status !== "pending") return invalidTransition("Only pending appointments can be confirmed or declined.");
    appointment.status = body.action === "confirm" ? "confirmed" : "cancelled";
  } else if (body.action === "cancel" || body.action === "reschedule") {
    if (body.action === "cancel") {
      if (appointment.status !== "pending" && appointment.status !== "confirmed" && appointment.status !== "upcoming") return invalidTransition("Only active appointments can be cancelled.");
      appointment.status = "cancelled";
    }
    else {
      if (appointment.status !== "confirmed" && appointment.status !== "upcoming") return invalidTransition("Only confirmed or upcoming appointments can be rescheduled.");
      if (!body.startsAt || Number.isNaN(new Date(body.startsAt).getTime())) return Response.json({ message: "A valid new appointment time is required." }, { status: 400 });
      const targetSlot = availabilitySlots.find((slot) => slot.doctorId === appointment.doctorId && slot.start === body.startsAt);
      const conflictingAppointment = appointments.some((item) => item.id !== appointment.id && item.doctorId === appointment.doctorId && item.status !== "cancelled" && (item.dateTime ?? item.startsAt) === body.startsAt);
      if (!targetSlot || targetSlot.isBooked || conflictingAppointment) return invalidTransition("The selected time is unavailable or already booked.");
      const previousSlot = availabilitySlots.find((slot) => slot.doctorId === appointment.doctorId && slot.start === startsAt);
      if (previousSlot) previousSlot.isBooked = false;
      targetSlot.isBooked = true;
      appointment.startsAt = body.startsAt;
      appointment.dateTime = body.startsAt;
    }
  } else {
    if (!isPastDue) return invalidTransition("Future appointments cannot be marked completed or missed.");
    if (appointment.status !== "confirmed" && appointment.status !== "upcoming") return invalidTransition("Only active appointments can be marked completed or missed.");
    appointment.status = body.action === "complete" ? "completed" : "missed";
  }

  if ((body.action === "decline" || body.action === "cancel") && appointment.status === "cancelled") {
    const slot = availabilitySlots.find((item) => item.doctorId === appointment.doctorId && item.start === startsAt);
    if (slot) slot.isBooked = false;
  }
  const notification = notificationsByAction[body.action];
  appointmentNotifications.unshift({ id: `notification-${Date.now()}`, appointmentId: appointment.id, recipientId: appointment.patientId ?? "", kind: notification.kind, message: notification.message, createdAt: new Date().toISOString(), read: false });
  return Response.json({ data: appointment });
}
