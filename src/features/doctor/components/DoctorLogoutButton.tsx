"use client";

import { useRouter } from "next/navigation";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";

export default function DoctorLogoutButton() {
  const router = useRouter();
  const { logout } = useDoctorAuth();
  return <button className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]" type="button" onClick={() => { logout(); router.replace("/login"); }}>Log out</button>;
}
