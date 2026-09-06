import type { AppointmentNotification } from "@/types/notification";

type NotificationsResponse = { data: AppointmentNotification[] };

export async function getNotifications(recipientId: string): Promise<AppointmentNotification[]> {
  const response = await fetch(`/api/notifications?recipientId=${encodeURIComponent(recipientId)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load notifications.");
  return (await response.json() as NotificationsResponse).data;
}

export async function markNotificationRead(recipientId: string, notificationId: string): Promise<AppointmentNotification> {
  const response = await fetch(`/api/notifications?id=${encodeURIComponent(notificationId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId }) });
  const body = await response.json() as { data?: AppointmentNotification; message?: string };
  if (!response.ok || !body.data) throw new Error(body.message ?? "Unable to update notification.");
  return body.data;
}

export async function dismissNotification(recipientId: string, notificationId: string): Promise<void> {
  const response = await fetch(`/api/notifications?id=${encodeURIComponent(notificationId)}&recipientId=${encodeURIComponent(recipientId)}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Unable to dismiss notification.");
}
