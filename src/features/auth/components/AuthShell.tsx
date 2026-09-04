import type { ReactNode } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative h-screen overflow-hidden bg-[var(--canvas)] px-4 py-4 sm:px-8 sm:py-8">
      <div className="mx-auto grid h-full min-h-0 max-w-6xl overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_24px_70px_rgba(27,41,37,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[var(--brand)] px-6 py-8 text-white sm:px-10 sm:py-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12" aria-labelledby="brand-title">
          <div className="absolute -right-20 -top-20 size-56 rounded-full border-[24px] border-white/10" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-16 size-64 rounded-full border-[28px] border-white/10" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-white font-serif text-2xl font-semibold text-[var(--brand)] shadow-lg">P</div>
              <span className="text-2xl font-bold tracking-tight">PulseCare</span>
            </div>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-emerald-100">Clinic operations</p>
            <h1 id="brand-title" className="mt-3 max-w-sm text-3xl font-semibold tracking-tight sm:text-4xl">Care that keeps moving.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-50 sm:text-base">A calmer way to coordinate visits, patients, and the people who care for them.</p>
          </div>
          <p className="relative mt-10 text-sm text-emerald-100">PulseCare for modern care teams</p>
        </section>
        <section className="auth-access-panel relative min-h-0 overflow-hidden bg-white px-5 py-5 sm:px-8 sm:py-6 lg:px-12" aria-label="Account access">
          <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6"><ThemeToggle /></div>
          <div className="flex h-full min-h-0 items-center justify-center overflow-hidden pt-2">
          {children}
          </div>
        </section>
      </div>
    </main>
  );
}