"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
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
<form className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm" onSubmit={handleSubmit} noValidate>      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">PulseCare</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-[var(--muted)]">Book and manage your doctor appointments.</p>
      </div>
      <div className="mt-5 space-y-2.5">
        <SignupInput id="name" label="Full name" type="text" autoComplete="name" value={name} error={errors.name} onChange={setName} />
        <SignupInput id="email" label="Email" type="email" autoComplete="email" value={email} error={errors.email} onChange={setEmail} />
        <SignupInput id="password" label="Password" type="password" autoComplete="new-password" value={password} error={errors.password} onChange={setPassword} />
        <SignupInput id="confirm-password" label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} error={errors.confirmPassword} onChange={setConfirmPassword} />
      </div>
      {serverError && <p className="mt-4 text-sm text-red-700" role="alert">{serverError}</p>}
      <button className="mt-4 w-full rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>
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
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleVisibility(): void {
    if (type !== "password") return;
    const selectionStart = inputRef.current?.selectionStart ?? value.length;
    const selectionEnd = inputRef.current?.selectionEnd ?? value.length;
    setIsVisible((visible) => !visible);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      input?.focus({ preventScroll: true });
      input?.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <div className="relative mt-1.5">
        <input ref={inputRef} className={`${type === "password" ? "auth-password-input pr-11" : ""} w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100`} id={id} name={id} type={type === "password" && isVisible ? "text" : type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} />
        {type === "password" && <button type="button" onClick={toggleVisibility} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)]" aria-label={isVisible ? "Hide password" : "Show password"} title={isVisible ? "Hide password" : "Show password"}>
          {isVisible ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
        </button>}
      </div>
      {error && <p className="mt-1 text-sm text-red-700" id={errorId}>{error}</p>}
    </div>
  );
}