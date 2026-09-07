"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid size-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="grid size-4 place-items-center" aria-hidden="true" suppressHydrationWarning>
        {isDark ? <Sun className="size-4 shrink-0" strokeWidth={2} /> : <Moon className="size-4 shrink-0" strokeWidth={2} />}
      </span>
    </button>
  );
}
