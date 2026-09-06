"use client";

import PortalNavbar from "@/components/layout/PortalNavbar";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";
import NotificationMenu from "@/features/notifications/components/NotificationMenu";

export default function DoctorNavbar() {
  const { doctor, logout } = useDoctorAuth();
  return <PortalNavbar navLinks={[{ href: "/doctor/dashboard", label: "Dashboard" }, { href: "/doctor/profile", label: "Profile" }, { href: "/doctor/appointments", label: "Appointments" }, { href: "/doctor/calendar", label: "Calendar" }]} user={doctor} logout={logout} logoutHref="/doctor/login" notifications={<NotificationMenu recipientId={doctor?.id} />} />;
}
