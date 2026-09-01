"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { validateLogin, type LoginFormErrors } from "@/features/auth/validation";

export default function LoginForm() {
  const router = useRouter();
  const { error: serverError, isLoading, user, submit } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateLogin(email, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const isLoggedIn = await submit(email, password);
    if (isLoggedIn) router.push("/");
  }

  if (user) {
    return (
      <section className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm" aria-live="polite">
        <p className="text-sm font-medium text-[var(--brand)]">Login successful</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome, {user.name}</h1>
        <p className="mt-2 text-[var(--muted)]">You are signed in as {user.email}.</p>
      </section>
    );
  }

  return (
    <form className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm" onSubmit={handleSubmit} noValidate>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Welcome back</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Log in to your account</h1>
        <p className="mt-2 text-[var(--muted)]">Access your doctor appointment dashboard.</p>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100" id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-describedby={errors.email ? "email-error" : undefined} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="mt-1 text-sm text-red-700" id="email-error">{errors.email}</p>}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100" id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={errors.password ? "password-error" : undefined} aria-invalid={Boolean(errors.password)} />
          {errors.password && <p className="mt-1 text-sm text-red-700" id="password-error">{errors.password}</p>}
        </div>
      </div>
      {serverError && <p className="mt-4 text-sm text-red-700" role="alert">{serverError}</p>}
      <button className="mt-6 w-full rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white shadow-sm hover:bg-[var(--brand-deep)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </button>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account? <Link className="font-semibold text-[var(--brand)] hover:underline" href="/signup">Sign up</Link>
      </p>
    </form>
  );
}