"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { updateDoctorProfile } from "@/features/doctor/api/profile";
import { saveDirectoryDoctor } from "@/features/doctor/directory";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";
import type { DoctorProfileFields } from "@/features/doctor/types";

const fieldClass = "mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100";

export default function DoctorProfile() {
  const { doctor, updateDoctor } = useDoctorAuth();
  const [profile, setProfile] = useState<DoctorProfileFields | null>(() => doctor);
  const [message, setMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  if (!doctor || !profile) return null;
  const doctorId = doctor.id;

  function updateProfileField(field: keyof DoctorProfileFields, value: string): void { setProfile((current) => current ? { ...current, [field]: field === "experienceYears" || field === "age" ? Number(value) : value } : current); }
  function updateProfileFile(field: "profileImage" | "licenseDocument", event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const result = typeof reader.result === "string" ? reader.result : ""; setProfile((current) => current ? { ...current, [field]: result } : current); };
    reader.readAsDataURL(file);
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>): Promise<void> { event.preventDefault(); if (!profile) return; setProfileError(""); setIsSavingProfile(true); try { const savedProfile = await updateDoctorProfile(doctorId, profile); saveDirectoryDoctor(savedProfile); updateDoctor(savedProfile); setProfile(savedProfile); setMessage("Profile saved."); } catch (error: unknown) { setProfileError(error instanceof Error ? error.message : "Unable to save your profile"); } finally { setIsSavingProfile(false); } }

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-6xl"><header className="flex flex-col gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">My Profile</h1><p className="mt-2 text-[var(--muted)]">Keep your practice details current.</p></div><Link className="font-semibold text-[var(--brand)] hover:underline" href="/doctor/dashboard">Back to dashboard</Link></header>
    <div className="mt-7 max-w-3xl"><form onSubmit={saveProfile} className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-semibold">Professional details</h2><p className="mt-1 text-sm text-[var(--muted)]">This information appears across your Doctor Portal.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Full name" value={profile.name} onChange={(value) => updateProfileField("name", value)} /><Field label="Email" type="email" value={profile.email} onChange={(value) => updateProfileField("email", value)} /><Field label="Specialization" value={profile.specialization} onChange={(value) => updateProfileField("specialization", value)} /><Field label="Qualification" value={profile.qualification} onChange={(value) => updateProfileField("qualification", value)} /><Field label="Experience (years)" type="number" value={String(profile.experienceYears)} onChange={(value) => updateProfileField("experienceYears", value)} /><Field label="Age" type="number" value={String(profile.age)} onChange={(value) => updateProfileField("age", value)} /><Field label="Phone number" type="tel" value={profile.phone} onChange={(value) => updateProfileField("phone", value)} /></div><label className="mt-4 block text-sm font-medium">Clinic address<input className={fieldClass} value={profile.clinicAddress} onChange={(event) => updateProfileField("clinicAddress", event.target.value)} /></label><label className="mt-4 block text-sm font-medium">Professional bio<textarea className={`${fieldClass} min-h-28 resize-y`} value={profile.bio} onChange={(event) => updateProfileField("bio", event.target.value)} /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Profile photo <span className="font-normal text-[var(--muted)]">(optional)</span><input className={fieldClass} type="file" accept="image/*" onChange={(event) => updateProfileFile("profileImage", event)} />{profile.profileImage && <img src={profile.profileImage} alt="Profile preview" className="mt-2 size-16 rounded-full object-cover" />}</label><label className="block text-sm font-medium">License / certificate document <span className="font-normal text-[var(--muted)]">(for credential verification)</span><input className={fieldClass} type="file" accept="application/pdf,image/*" onChange={(event) => updateProfileFile("licenseDocument", event)} />{profile.licenseDocument && <p className="mt-2 text-xs font-medium text-emerald-700">Document uploaded ✓</p>}</label></div>{profileError && <p className="mt-4 text-sm text-red-700" role="alert">{profileError}</p>}{message && <p className="mt-4 text-sm font-medium text-emerald-700" role="status">{message}</p>}<button className="mt-5 rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60" type="submit" disabled={isSavingProfile}>{isSavingProfile ? "Saving profile..." : "Save profile"}</button></form></div>
  </div></main>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "email" | "number" | "tel" }) { return <label className="block text-sm font-medium">{label}<input className={fieldClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
