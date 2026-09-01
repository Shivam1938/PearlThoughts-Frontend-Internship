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
      className="fixed right-4 top-4 z-10 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm hover:border-[var(--brand)] hover:text-[var(--brand)] sm:right-8 sm:top-8"
      type="button"
      onClick={handleLogout}
    >
      Log out
    </button>
  );
}