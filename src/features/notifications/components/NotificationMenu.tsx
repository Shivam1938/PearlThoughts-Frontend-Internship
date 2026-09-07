"use client";

import { Bell, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { dismissNotification, getNotifications, markNotificationRead } from "@/features/notifications/api/notifications";
import type { AppointmentNotification } from "@/types/notification";

export default function NotificationMenu({ recipientId }: { recipientId?: string }) {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipientId) return;
    let active = true;
    void getNotifications(recipientId).then((data) => { if (active) setNotifications(data); }).catch(() => { if (active) setError("Notifications could not be loaded."); });
    return () => { active = false; };
  }, [recipientId]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  async function readNotification(notification: AppointmentNotification): Promise<void> {
    if (!recipientId || notification.read) return;
    try {
      const updated = await markNotificationRead(recipientId, notification.id);
      setNotifications((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch { setError("Notification could not be marked read."); }
  }
  async function removeNotification(notification: AppointmentNotification): Promise<void> {
    if (!recipientId) return;
    try {
      await dismissNotification(recipientId, notification.id);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
    } catch { setError("Notification could not be dismissed."); }
  }

  return <div className="relative"><button type="button" className="relative grid size-9 place-items-center rounded-lg text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--brand)]" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} title="Notifications" aria-expanded={open} onClick={() => setOpen((current) => !current)}><Bell className="size-5" aria-hidden="true" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-4 text-white" aria-hidden="true">{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>{open && <section className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[0_16px_35px_rgba(27,41,37,0.16)]" aria-label="Notifications"><div className="border-b border-[var(--line)] px-4 py-3"><p className="font-semibold">Notifications</p><p className="text-xs text-[var(--muted)]">{unreadCount} unread</p></div>{error && <p className="px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}{notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">No notifications yet.</p> : <ul className="max-h-96 overflow-y-auto divide-y divide-[var(--line)]">{notifications.map((notification) => <li className={`${notification.read ? "bg-white" : "bg-emerald-50/50"} flex gap-2 p-3`} key={notification.id}><button className="min-w-0 flex-1 text-left" type="button" onClick={() => void readNotification(notification)}><p className="text-sm font-medium text-[var(--ink)]">{notification.message}</p><p className="mt-1 text-xs capitalize text-[var(--muted)]">{notification.kind.replaceAll("_", " ")} · {new Date(notification.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p></button><button className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] hover:bg-red-50 hover:text-red-700" type="button" onClick={() => void removeNotification(notification)} aria-label="Dismiss notification"><Trash2 className="size-4" aria-hidden="true" /></button></li>)}</ul>}</section>}</div>;
}
