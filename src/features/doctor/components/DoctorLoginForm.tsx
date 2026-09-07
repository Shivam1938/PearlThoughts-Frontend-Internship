"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useDoctorLogin } from "@/features/doctor/hooks/useDoctorLogin";
import { validateLogin, type LoginFormErrors } from "@/features/auth/validation";

export default function DoctorLoginForm() {
  const router = useRouter();
  const { error: serverError, isLoading, submit } = useDoctorLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateLogin(email, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (await submit(email, password)) router.push("/doctor/dashboard");
  }

  return (
    <form className="auth-form-card w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm" onSubmit={handleSubmit} noValidate>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Doctor portal</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Log in to your practice</h1>
      <p className="mt-2 text-[var(--muted)]">Manage your appointments and availability.</p>
      <div className="mt-6 space-y-4">
        <LoginField id="doctor-email" label="Email" type="email" value={email} error={errors.email} onChange={setEmail} />
        <LoginField id="doctor-password" label="Password" type="password" value={password} error={errors.password} onChange={setPassword} />
      </div>
      {serverError && <p className="mt-4 text-sm text-red-700" role="alert">{serverError}</p>}
      <button className="mt-6 w-full rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Log in to Doctor Portal"}</button>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">New to PulseCare? <Link className="font-semibold text-[var(--brand)] hover:underline" href="/doctor/register">Create a doctor account</Link></p>
      <p className="mt-3 text-center text-sm text-[var(--muted)]">Looking for patient login? <Link className="font-semibold text-[var(--brand)] hover:underline" href="/login">Go to user login</Link></p>
    </form>
  );
}

type LoginFieldProps = { id: string; label: string; type: "email" | "password"; value: string; error?: string; onChange: (value: string) => void };

function LoginField({ id, label, type, value, error, onChange }: LoginFieldProps) {
  const errorId = `${id}-error`;
  return <div><label className="text-sm font-medium" htmlFor={id}>{label}</label><input className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100" id={id} name={id} type={type} autoComplete={type === "email" ? "email" : "current-password"} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} />{error && <p className="mt-1 text-sm text-red-700" id={errorId}>{error}</p>}</div>;
}
