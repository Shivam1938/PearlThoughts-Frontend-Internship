"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useDoctorRegistration } from "@/features/doctor/hooks/useDoctorRegistration";
import type { DoctorRegistrationFormErrors } from "@/features/doctor/types";
import { validateDoctorRegistration } from "@/features/doctor/validation";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  specialization: "",
  qualification: "",
  experienceYears: "",
  phone: "",
  clinicAddress: "",
  bio: "",
  profileImage: "",
};

export default function DoctorRegistrationForm() {
  const router = useRouter();
  const { error: serverError, isLoading, submit } = useDoctorRegistration();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<DoctorRegistrationFormErrors>({});

  function updateField(field: keyof typeof initialValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateDoctorRegistration(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const isRegistered = await submit({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      specialization: values.specialization.trim(),
      qualification: values.qualification.trim(),
      experienceYears: Number(values.experienceYears),
      phone: values.phone.trim(),
      clinicAddress: values.clinicAddress.trim(),
      bio: values.bio.trim(),
      profileImage: values.profileImage.trim(),
    });
    if (isRegistered) router.push("/doctor/login");
  }

  return (
    <form className="auth-form-card w-full max-w-2xl rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6" onSubmit={handleSubmit} noValidate>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand)]">Doctor portal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create your doctor account</h1>
        <p className="mt-2 text-[var(--muted)]">Share the details patients need to find and trust your practice.</p>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Personal & account details</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Full name" name="name" value={values.name} error={errors.name} onChange={updateField} autoComplete="name" />
          <Field label="Email" name="email" type="email" value={values.email} error={errors.email} onChange={updateField} autoComplete="email" />
          <Field label="Password" name="password" type="password" value={values.password} error={errors.password} onChange={updateField} autoComplete="new-password" />
          <Field label="Confirm password" name="confirmPassword" type="password" value={values.confirmPassword} error={errors.confirmPassword} onChange={updateField} autoComplete="new-password" />
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Professional details</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Specialization" name="specialization" value={values.specialization} error={errors.specialization} onChange={updateField} />
          <Field label="Qualification" name="qualification" value={values.qualification} error={errors.qualification} onChange={updateField} />
          <Field label="Years of experience" name="experienceYears" type="number" value={values.experienceYears} error={errors.experienceYears} onChange={updateField} inputMode="numeric" />
          <Field label="Profile image URL" name="profileImage" type="url" value={values.profileImage} error={errors.profileImage} onChange={updateField} />
        </div>
        <div className="mt-3">
          <Field label="Professional bio" name="bio" value={values.bio} error={errors.bio} onChange={updateField} multiline />
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Contact details</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Phone number" name="phone" type="tel" value={values.phone} error={errors.phone} onChange={updateField} autoComplete="tel" />
          <Field label="Clinic address" name="clinicAddress" value={values.clinicAddress} error={errors.clinicAddress} onChange={updateField} autoComplete="street-address" />
        </div>
      </fieldset>

      {serverError && <p className="mt-4 text-sm text-red-700" role="alert">{serverError}</p>}
      <button className="mt-6 w-full rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>
        {isLoading ? "Creating doctor account..." : "Create doctor account"}
      </button>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Already registered? <Link className="font-semibold text-[var(--brand)] hover:underline" href="/doctor/login">Log in to the Doctor Portal</Link>
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: keyof typeof initialValues;
  value: string;
  error?: string;
  onChange: (field: keyof typeof initialValues, value: string) => void;
  type?: "email" | "number" | "password" | "tel" | "text" | "url";
  autoComplete?: string;
  inputMode?: "numeric";
  multiline?: boolean;
};

function Field({ label, name, value, error, onChange, type = "text", autoComplete, inputMode, multiline }: FieldProps) {
  const id = `doctor-${name}`;
  const errorId = `${id}-error`;
  const className = "mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100";

  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea className={`${className} min-h-24 resize-y`} id={id} name={name} value={value} onChange={(event) => onChange(name, event.target.value)} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} />
      ) : (
        <input className={className} id={id} name={name} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} autoComplete={autoComplete} inputMode={inputMode} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} />
      )}
      {error && <p className="mt-1 text-sm text-red-700" id={errorId}>{error}</p>}
    </div>
  );
}
