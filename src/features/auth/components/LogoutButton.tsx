"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/auth-context";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout(): void {
    logout();
    router.replace("/login");
  }

  return (
    <button
      className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
      type="button"
      onClick={handleLogout}
    >
      Log out
    </button>
  );
}