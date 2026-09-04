"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Settings, UserCircle } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/auth-context";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  function handleLogout(): void {
    logout();
    router.replace("/login");
  }

  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] font-serif text-lg text-white" aria-hidden="true">P</span>
          <span>PulseCare</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`app-nav-link rounded-lg px-3 py-2 text-sm font-semibold ${pathname === "/" ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--ink)]"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/doctors"
            className={`app-nav-link rounded-lg px-3 py-2 text-sm font-semibold ${pathname === "/doctors" ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--ink)]"}`}
          >
            Find Doctors
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--brand)]"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--brand)]"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="size-5" aria-hidden="true" />
          </button>
          <ThemeToggle />
          <div className="group relative">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)] hover:border-[var(--brand)]"
              aria-label="Open profile menu"
              title="Profile"
              aria-haspopup="true"
            >
              {initials || <UserCircle className="size-5" aria-hidden="true" />}
            </button>
            <div className="invisible absolute right-0 top-full z-10 mt-2 w-64 translate-y-1 rounded-xl border border-[var(--line)] bg-white p-4 opacity-0 shadow-[0_16px_35px_rgba(27,41,37,0.16)] transition before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-sm font-bold text-white" aria-hidden="true">
                  {initials || <UserCircle className="size-6" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--ink)]">{user?.name}</p>
                  <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
