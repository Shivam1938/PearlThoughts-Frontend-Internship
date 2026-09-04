"use client";

import type { ReactNode } from "react";
import AppNavbar from "@/components/layout/AppNavbar";

type AuthenticatedShellProps = {
  children: ReactNode;
};

export default function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <AppNavbar />
      <div className="pt-[88px]">{children}</div>
    </div>
  );
}
