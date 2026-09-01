"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSignup } from "@/features/auth/hooks/useSignup";
import { validateSignup, type SignupFormErrors } from "@/features/auth/validation";

export default function SignupForm() {
  const router = useRouter();
  const { error: serverError, isLoading, user, submit } = useSignup();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<SignupFormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateSignup(name, email, password, confirmPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const isSignedUp = await submit(name, email, password);
    if (isSignedUp) router.push("/");
  }

  if (user) return <p className="text-sm text-[var(--brand)]" role="status">Account created. Redirecting...</p>;

  return (
    <form className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm" onSubmit={handleSubmit} noValidate>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Schedula</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-[var(--muted)]">Book and manage your doctor appointments.</p>
      </div>
      <div className="mt-6 space-y-3">
        <SignupInput id="name" label="Full name" type="text" autoComplete="name" value={name} error={errors.name} onChange={setName} />
        <SignupInput id="email" label="Email" type="email" autoComplete="email" value={email} error={errors.email} onChange={setEmail} />
        <SignupInput id="password" label="Password" type="password" autoComplete="new-password" value={password} error={errors.password} onChange={setPassword} />
        <SignupInput id="confirm-password" label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} error={errors.confirmPassword} onChange={setConfirmPassword} />
      </div>
      {serverError && <p className="mt-4 text-sm text-red-700" role="alert">{serverError}</p>}
      <button className="mt-5 w-full rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </button>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Already have an account? <Link className="font-semibold text-[var(--brand)] hover:underline" href="/login">Log in</Link>
      </p>
    </form>
  );
}

type SignupInputProps = {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function SignupInput({ id, label, type, autoComplete, value, error, onChange }: SignupInputProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <input className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100" id={id} name={id} type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} />
      {error && <p className="mt-1 text-sm text-red-700" id={errorId}>{error}</p>}
    </div>
  );
}