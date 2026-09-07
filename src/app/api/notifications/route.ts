import { appointmentNotifications } from "@/lib/mock-data/notifications";

export async function GET(request: Request) {
  const recipientId = new URL(request.url).searchParams.get("recipientId");
  if (!recipientId) return Response.json({ message: "A recipient ID is required." }, { status: 400 });
  const data = appointmentNotifications.filter((notification) => notification.recipientId === recipientId);
  return Response.json({ data, meta: { total: data.length, unread: data.filter((notification) => !notification.read).length } });
}

export async function PATCH(request: Request) {
  const notificationId = new URL(request.url).searchParams.get("id");
  const body = await request.json().catch(() => null) as { recipientId?: string } | null;
  const notification = appointmentNotifications.find((item) => item.id === notificationId && item.recipientId === body?.recipientId);
  if (!notification) return Response.json({ message: "Notification not found." }, { status: 404 });
  notification.read = true;
  return Response.json({ data: notification });
}

export async function DELETE(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const notificationId = searchParams.get("id");
  const recipientId = searchParams.get("recipientId");
  const index = appointmentNotifications.findIndex((item) => item.id === notificationId && item.recipientId === recipientId);
  if (index === -1) return Response.json({ message: "Notification not found." }, { status: 404 });
  appointmentNotifications.splice(index, 1);
  return new Response(null, { status: 204 });
}
