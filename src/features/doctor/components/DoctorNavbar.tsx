"use client";

import PortalNavbar from "@/components/layout/PortalNavbar";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";

export default function DoctorNavbar() {
  const { doctor, logout } = useDoctorAuth();
  return <PortalNavbar navLinks={[{ href: "/doctor/dashboard", label: "Dashboard" }, { href: "/doctor/profile", label: "Profile" }, { href: "/doctor/appointments", label: "Appointments" }]} user={doctor} logout={logout} logoutHref="/doctor/login" />;
}
