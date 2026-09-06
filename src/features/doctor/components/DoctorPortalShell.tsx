"use client";

import type { ReactNode } from "react";
import DoctorNavbar from "@/features/doctor/components/DoctorNavbar";

export default function DoctorPortalShell({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]"><DoctorNavbar /><div className="pt-[88px]">{children}</div></div>; }
