"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AuthenticatedShell from "@/components/layout/AuthenticatedShell";
import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/hooks/auth-context";
import DoctorLoginForm from "@/features/doctor/components/DoctorLoginForm";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";

export default function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isReady, user } = useAuth();
  const { isReady: isDoctorReady, doctor } = useDoctorAuth();

  if (!isReady || !isDoctorReady) return null;

  const isDoctorRoute = pathname.startsWith("/doctor");
  const isPublicDoctorRoute = pathname === "/doctor/login" || pathname === "/doctor/register";
  if (isDoctorRoute) {
    if (!isPublicDoctorRoute && !doctor) return <AuthShell><DoctorLoginForm /></AuthShell>;
    return children;
  }

  const isPublicAuthRoute = pathname === "/login" || pathname === "/signup";

  if (!isPublicAuthRoute && !user) {
    return <AuthShell><LoginForm /></AuthShell>;
  }

  if (pathname !== "/login" && user) {
    return <AuthenticatedShell>{children}</AuthenticatedShell>;
  }

  return children;
}
