import React from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";

type AuthShellProps = {
  children: React.ReactNode;
  layout?: "default" | "wide";
};

export default function AuthShell({ children, layout = "default" }: AuthShellProps) {
  return (
    <main className="relative h-screen overflow-hidden bg-[var(--canvas)] px-4 py-4 sm:px-8 sm:py-8">
      <div className="mx-auto grid h-full min-h-0 max-w-6xl overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.06)] lg:grid-cols-12">
        
        {/* Left Side Banner */}
        <section className="relative overflow-hidden bg-[var(--brand)] px-6 py-8 text-white sm:px-10 sm:py-10 lg:flex lg:flex-col lg:justify-between lg:col-span-5">
          <div className="absolute -right-20 -top-20 size-56 rounded-full border-[24px] border-white/10" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-16 size-64 rounded-full border-[28px] border-white/10" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-white font-serif text-2xl font-semibold text-[var(--brand)] shadow-lg">P</div>
              <span className="text-2xl font-bold tracking-tight">PulseCare</span>
            </div>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-emerald-100">Clinic Operations</p>
            <h1 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight sm:text-4xl">Care that keeps moving.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-50 sm:text-base">A calmer way to coordinate visits, patients, and the people who care for them.</p>
          </div>
          <p className="relative mt-10 text-sm text-emerald-100">PulseCare for modern care teams</p>
        </section>

        {/* Right Side Form Container */}
       <section className={`auth-access-panel relative min-h-0 overflow-hidden bg-white px-5 py-5 sm:px-8 sm:py-6 ${layout === "wide" ? "lg:col-span-7" : "lg:col-span-7"}`}>
  <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6"><ThemeToggle /></div>
  
  {/* Right side wrapper element for full height scrolling */}
  <div className="auth-scroll-container h-full w-full overflow-y-auto pr-2 flex items-center justify-center pt-8 pb-4">
    {children}
  </div>
</section>

      </div>
    </main>
  );
}