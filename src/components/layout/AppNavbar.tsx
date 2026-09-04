"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/features/auth/components/LogoutButton";

export default function AppNavbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--line)] bg-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] font-serif text-lg text-white" aria-hidden="true">S</span>
          <span>Schedula</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${pathname === "/" ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--ink)]"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/doctors"
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${pathname === "/doctors" ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-stone-50 hover:text-[var(--ink)]"}`}
          >
            Find Doctors
          </Link>
          <LogoutButton />
        </div>
      </nav>
    </header>
  );
}
