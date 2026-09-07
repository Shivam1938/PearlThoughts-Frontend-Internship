import type { AppointmentNotification } from "@/types/notification";

export const appointmentNotifications: AppointmentNotification[] = [
  { id: "notification-confirmed", appointmentId: "apt-confirmed", recipientId: "user-001", kind: "booking_confirmed", message: "Your appointment has been confirmed.", createdAt: "2026-09-01T09:00:00.000Z", read: false },
  { id: "notification-rescheduled", appointmentId: "apt-upcoming", recipientId: "user-001", kind: "rescheduled", message: "Your appointment time was rescheduled.", createdAt: "2026-09-02T09:00:00.000Z", read: false },
  { id: "notification-cancelled", appointmentId: "apt-cancelled", recipientId: "user-002", kind: "cancelled", message: "Your appointment was cancelled.", createdAt: "2026-09-03T09:00:00.000Z", read: false },
  { id: "notification-reminder", appointmentId: "apt-upcoming", recipientId: "user-001", kind: "reminder", message: "You have an appointment tomorrow.", createdAt: "2026-09-04T09:00:00.000Z", read: true },
  { id: "notification-missed", appointmentId: "apt-missed", recipientId: "user-002", kind: "missed", message: "Your appointment was marked missed.", createdAt: "2026-09-05T09:00:00.000Z", read: false },
  { id: "notification-completed", appointmentId: "apt-completed", recipientId: "user-001", kind: "completed", message: "Your appointment was completed.", createdAt: "2026-09-06T09:00:00.000Z", read: true },
  { id: "notification-prescription", appointmentId: "apt-completed", recipientId: "user-001", kind: "prescription_available", message: "Your prescription is available.", createdAt: "2026-09-06T10:00:00.000Z", read: false },
];
