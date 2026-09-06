"use client";

import { useAuth } from "@/features/auth/hooks/auth-context";
import PortalNavbar from "@/components/layout/PortalNavbar";

export default function AppNavbar() {
  const { logout, user } = useAuth();
  return <PortalNavbar navLinks={[{ href: "/", label: "Dashboard" }, { href: "/doctors", label: "Find Doctors" }]} user={user} logout={logout} logoutHref="/login" />;
}
