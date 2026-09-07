"use client";

import { FileText, HeartPulse, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/auth-context";
import { getPatientProfile } from "@/features/patient/api/getProfile";
import { getPatientSummary, type PatientSummary } from "@/features/patient/api/getSummary";
import { updatePatientProfile } from "@/features/patient/api/updateProfile";
import type { PatientProfile } from "@/types/patient";

const fieldClass = "mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100";

function toListInput(values: string[]): string { return values.join(", "); }
function fromListInput(value: string): string[] { return value.split(",").map((item) => item.trim()).filter(Boolean); }

export default function PatientProfileView() {
  const { user, isReady } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setLoadError(null);
    Promise.all([getPatientProfile(user.id), getPatientSummary(user.id)])
      .then(([profileData, summaryData]) => { if (active) { setProfile(profileData); setSummary(summaryData); } })
      .catch(() => { if (active) setLoadError("Your profile could not be loaded. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  function updateField<K extends keyof PatientProfile>(field: K, value: PatientProfile[K]): void {
    setProfile((current) => current ? { ...current, [field]: value } : current);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!profile) return;
    setSaveError(null);
    setSavedMessage(null);
    setIsSaving(true);
    try {
      const saved = await updatePatientProfile(profile);
      setProfile(saved);
      setSavedMessage("Profile saved.");
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : "Unable to save your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const isLoading = !isReady || (user !== null && loading);

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-5xl">
    <header className="border-b border-[var(--line)] pb-6"><p className="text-sm font-medium uppercase tracking-[.18em] text-sky-600">My account</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Profile</h1><p className="mt-2 text-[var(--muted)]">Keep your personal and medical details up to date.</p></header>

    <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Profile summary">
      <SummaryCard label="Total Prescriptions" value={summary?.totalPrescriptions} icon={<FileText className="size-5" aria-hidden="true" />} tone="bg-emerald-50 text-emerald-600" />
      <SummaryCard label="Completed Appointments" value={summary?.completedAppointments} icon={<ShieldCheck className="size-5" aria-hidden="true" />} tone="bg-sky-50 text-sky-600" />
      <SummaryCard label="Test Reports" value={summary?.testReports} icon={<HeartPulse className="size-5" aria-hidden="true" />} tone="bg-rose-50 text-rose-600" />
    </section>

    {isLoading ? <p className="mt-7 rounded-xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Loading your profile…</p>
      : loadError ? <p className="mt-7 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">{loadError}</p>
      : profile && <form className="mt-7 space-y-6" onSubmit={(event) => void handleSubmit(event)}>
        <FieldsetCard title="Personal information" description="Your basic contact details.">
          <Field label="Full name" value={profile.name} onChange={(value) => updateField("name", value)} />
          <Field label="Email" type="email" value={profile.email} onChange={(value) => updateField("email", value)} />
          <Field label="Phone number" type="tel" value={profile.phone} onChange={(value) => updateField("phone", value)} />
          <Field label="Date of birth" type="date" value={profile.dateOfBirth} onChange={(value) => updateField("dateOfBirth", value)} />
          <Field label="Gender" value={profile.gender} onChange={(value) => updateField("gender", value)} />
        </FieldsetCard>

        <FieldsetCard title="Physical details" description="Used to personalize your care.">
          <Field label="Height (cm)" type="number" value={String(profile.heightCm)} onChange={(value) => updateField("heightCm", Number(value) || 0)} />
          <Field label="Weight (kg)" type="number" value={String(profile.weightKg)} onChange={(value) => updateField("weightKg", Number(value) || 0)} />
          <Field label="Blood group" value={profile.bloodGroup} onChange={(value) => updateField("bloodGroup", value)} />
        </FieldsetCard>

        <FieldsetCard title="Medical conditions & allergies" description="Separate multiple entries with commas.">
          <ListField label="Medical conditions" value={profile.medicalConditions} onChange={(value) => updateField("medicalConditions", value)} />
          <ListField label="Allergies" value={profile.allergies} onChange={(value) => updateField("allergies", value)} />
          <ListField label="Current medications" value={profile.currentMedications} onChange={(value) => updateField("currentMedications", value)} />
        </FieldsetCard>

        <FieldsetCard title="Insurance details" description="Shared with your care team when needed.">
          <Field label="Insurance provider" value={profile.insuranceProvider} onChange={(value) => updateField("insuranceProvider", value)} />
          <Field label="Policy number" value={profile.insurancePolicyNumber} onChange={(value) => updateField("insurancePolicyNumber", value)} />
        </FieldsetCard>

        <FieldsetCard title="Emergency contact" description="Who we should reach in an emergency.">
          <Field label="Contact name" value={profile.emergencyContactName} onChange={(value) => updateField("emergencyContactName", value)} />
          <Field label="Relation" value={profile.emergencyContactRelation} onChange={(value) => updateField("emergencyContactRelation", value)} />
          <Field label="Contact phone" type="tel" value={profile.emergencyContactPhone} onChange={(value) => updateField("emergencyContactPhone", value)} />
        </FieldsetCard>

        {saveError && <p className="text-sm text-red-700" role="alert">{saveError}</p>}
        {savedMessage && <p className="text-sm font-medium text-emerald-700" role="status">{savedMessage}</p>}
        <button className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60" type="submit" disabled={isSaving}>{isSaving ? "Saving profile…" : "Save profile"}</button>
      </form>}
  </div></main>;
}

function SummaryCard({ label, value, icon, tone }: { label: string; value: number | undefined; icon: React.ReactNode; tone: string }) {
  return <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm"><div><p className="text-xs font-medium text-[var(--muted)]">{label}</p><p className="mt-1 text-2xl font-semibold text-[var(--ink)]">{value ?? "—"}</p></div><span className={`grid size-10 place-items-center rounded-lg ${tone}`}>{icon}</span></div>;
}

function FieldsetCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{description}</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div></div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "email" | "number" | "tel" | "date" }) {
  return <label className="block text-sm font-medium">{label}<input className={fieldClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <label className="block text-sm font-medium sm:col-span-2">{label} <span className="font-normal text-[var(--muted)]">(comma separated)</span><input className={fieldClass} value={toListInput(value)} onChange={(event) => onChange(fromListInput(event.target.value))} placeholder="None" /></label>;
}
