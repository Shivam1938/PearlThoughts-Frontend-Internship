export type NotificationKind = "booking_confirmed" | "rescheduled" | "cancelled" | "reminder" | "missed" | "completed" | "prescription_available";

export type AppointmentNotification = {
  id: string;
  appointmentId: string;
  recipientId: string;
  kind: NotificationKind;
  message: string;
  createdAt: string;
  read: boolean;
};
