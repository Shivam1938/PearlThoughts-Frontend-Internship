"use client";

import { useAuth } from "@/features/auth/hooks/auth-context";
import NotificationMenu from "@/features/notifications/components/NotificationMenu";
import PortalNavbar from "@/components/layout/PortalNavbar";

export default function AppNavbar() {
  const { logout, user } = useAuth();
  return <PortalNavbar navLinks={[{ href: "/", label: "Dashboard" }, { href: "/doctors", label: "Find Doctors" }, { href: "/profile", label: "My Profile" }]} user={user} logout={logout} logoutHref="/login" notifications={<NotificationMenu recipientId={user?.id} />} />;
}
