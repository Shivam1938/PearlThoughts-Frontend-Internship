"use client";

import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDoctorAppointments } from "@/features/doctor/api/getAppointments";
import { getDoctorPrescriptions } from "@/features/doctor/api/getPrescriptions";
import { createPrescription, updatePrescription } from "@/features/doctor/api/savePrescription";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";
import type { Appointment } from "@/types/appointment";
import type { Medicine, Prescription, PrescriptionFormValues } from "@/types/prescription";

const fieldClass = "mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100";

function emptyMedicine(): Medicine {
  return { id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "", dosage: "", frequency: "", duration: "" };
}

function formatDate(appointment: Appointment): string {
  return new Date(appointment.dateTime ?? appointment.startsAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

export default function DoctorPrescriptions() {
  const { doctor, isReady } = useDoctorAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!doctor) return;
    let active = true;
    setLoading(true);
    setLoadError(null);
    Promise.all([getDoctorAppointments(doctor.id, "completed"), getDoctorPrescriptions(doctor.id)])
      .then(([appointmentData, prescriptionData]) => {
        if (!active) return;
        const sorted = [...appointmentData].sort((left, right) => (right.dateTime ?? right.startsAt).localeCompare(left.dateTime ?? left.startsAt));
        setAppointments(sorted);
        setPrescriptions(prescriptionData);
        setSelectedAppointmentId((current) => (current && sorted.some((item) => item.id === current)) ? current : (sorted[0]?.id ?? null));
      })
      .catch(() => { if (active) setLoadError("Completed appointments could not be loaded. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doctor, refreshKey]);

  const filteredAppointments = appointments.filter((appointment) => !query.trim() || appointment.patient.name.toLowerCase().includes(query.trim().toLowerCase()));
  const prescriptionByAppointmentId = useMemo(() => new Map(prescriptions.map((prescription) => [prescription.appointmentId, prescription])), [prescriptions]);
  const selectedAppointment = filteredAppointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null;
  const selectedPrescription = selectedAppointment ? prescriptionByAppointmentId.get(selectedAppointment.id) ?? null : null;
  const isLoading = !isReady || (doctor !== null && loading);

  function handleSaved(saved: Prescription): void {
    setPrescriptions((current) => {
      const withoutSaved = current.filter((item) => item.id !== saved.id);
      return [saved, ...withoutSaved];
    });
  }

  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-6xl">
    <header className="flex flex-col gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[var(--brand)]">Doctor portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Prescriptions</h1><p className="mt-2 text-[var(--muted)]">Create and edit prescriptions for your completed appointments.</p></div></header>

    <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,1.1fr)]">
      <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6"><label><span className="sr-only">Search by patient name</span><input className={fieldClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by patient name" /></label></div>
        {isLoading ? <p className="px-6 py-12 text-center text-sm text-[var(--muted)]">Loading completed appointments…</p>
          : loadError ? <p className="px-6 py-12 text-center text-sm text-rose-700">{loadError}</p>
          : filteredAppointments.length === 0 ? <EmptyState />
          : <ul className="divide-y divide-[var(--line)]">{filteredAppointments.map((appointment) => {
              const hasPrescription = prescriptionByAppointmentId.has(appointment.id);
              return <li key={appointment.id}><button type="button" className={`grid w-full gap-2 px-5 py-4 text-left transition hover:bg-stone-50 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 ${selectedAppointmentId === appointment.id ? "bg-emerald-50/60" : ""}`} onClick={() => setSelectedAppointmentId(appointment.id)} aria-pressed={selectedAppointmentId === appointment.id}>
                <span className="min-w-0"><span className="block truncate font-semibold">{appointment.patient.name}</span><span className="mt-0.5 block text-sm text-[var(--muted)]">{appointment.type ?? appointment.reason} · {formatDate(appointment)}</span></span>
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${hasPrescription ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`}>{hasPrescription ? "Prescribed" : "Needs prescription"}</span>
              </button></li>;
            })}</ul>}
      </div>
      <PrescriptionPanel key={selectedAppointment?.id ?? "none"} appointment={selectedAppointment} prescription={selectedPrescription} doctorId={doctor?.id ?? ""} onSaved={handleSaved} />
    </section>
  </div></main>;
}

function PrescriptionPanel({ appointment, prescription, doctorId, onSaved }: { appointment: Appointment | null; prescription: Prescription | null; doctorId: string; onSaved: (prescription: Prescription) => void }) {
  const [diagnosis, setDiagnosis] = useState(prescription?.diagnosis ?? "");
  const [medicines, setMedicines] = useState<Medicine[]>(prescription?.medicines.length ? prescription.medicines : [emptyMedicine()]);
  const [instructions, setInstructions] = useState(prescription?.instructions ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (!appointment) return <aside className="h-fit rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm"><p className="text-sm text-[var(--muted)]">Select a completed appointment to view or write a prescription.</p></aside>;

  function updateMedicine(id: string, field: keyof Medicine, value: string): void {
    setMedicines((current) => current.map((medicine) => medicine.id === id ? { ...medicine, [field]: value } : medicine));
  }
  function addMedicineRow(): void { setMedicines((current) => [...current, emptyMedicine()]); }
  function removeMedicineRow(id: string): void { setMedicines((current) => current.length > 1 ? current.filter((medicine) => medicine.id !== id) : current); }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setSavedMessage(null);
    if (!diagnosis.trim()) { setFormError("Diagnosis is required."); return; }
    const namedMedicines = medicines.filter((medicine) => medicine.name.trim());
    if (!namedMedicines.length) { setFormError("Add at least one medicine."); return; }

    const values: PrescriptionFormValues = { diagnosis: diagnosis.trim(), medicines: namedMedicines, instructions: instructions.trim() };
    setIsSaving(true);
    try {
      const saved = prescription
        ? await updatePrescription(doctorId, prescription.id, values)
        : await createPrescription(doctorId, appointment!.id, values);
      onSaved(saved);
      setSavedMessage(prescription ? "Prescription updated." : "Prescription created.");
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : "Unable to save the prescription.");
    } finally {
      setIsSaving(false);
    }
  }

  return <aside className="h-fit rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-[var(--brand-deep)]"><ClipboardList className="size-5" aria-hidden="true" /></span><div><p className="text-sm font-medium text-[var(--brand)]">{prescription ? "Edit prescription" : "New prescription"}</p><h2 className="font-semibold">{appointment.patient.name}</h2></div></div>
    <p className="mt-1 text-sm text-[var(--muted)]">{appointment.type ?? appointment.reason} · {formatDate(appointment)}</p>

    <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <label className="block text-sm font-medium">Diagnosis<textarea className={`${fieldClass} min-h-20 resize-y`} value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} placeholder="e.g. Seasonal allergic rhinitis" required /></label>

      <div><div className="flex items-center justify-between"><p className="text-sm font-medium">Medicines</p><button type="button" onClick={addMedicineRow} className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] hover:bg-emerald-50"><Plus className="size-3.5" aria-hidden="true" />Add medicine</button></div>
        <div className="mt-3 space-y-3">{medicines.map((medicine, index) => <div key={medicine.id} className="rounded-lg border border-[var(--line)] bg-[var(--canvas)] p-3"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Medicine {index + 1}</p>{medicines.length > 1 && <button type="button" onClick={() => removeMedicineRow(medicine.id)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-700" aria-label={`Remove medicine ${index + 1}`}><Trash2 className="size-3.5" /></button>}</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2"><input className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" value={medicine.name} onChange={(event) => updateMedicine(medicine.id, "name", event.target.value)} placeholder="Medicine name" /><input className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" value={medicine.dosage} onChange={(event) => updateMedicine(medicine.id, "dosage", event.target.value)} placeholder="Dosage, e.g. 500mg" /><input className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" value={medicine.frequency} onChange={(event) => updateMedicine(medicine.id, "frequency", event.target.value)} placeholder="Frequency, e.g. Twice daily" /><input className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" value={medicine.duration} onChange={(event) => updateMedicine(medicine.id, "duration", event.target.value)} placeholder="Duration, e.g. 5 days" /></div>
        </div>)}</div>
      </div>

      <label className="block text-sm font-medium">Instructions<textarea className={`${fieldClass} min-h-20 resize-y`} value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="e.g. Avoid dust exposure, drink plenty of fluids" /></label>

      {formError && <p className="text-sm text-red-700" role="alert">{formError}</p>}
      {savedMessage && <p className="text-sm font-medium text-emerald-700" role="status">{savedMessage}</p>}
      <button className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : prescription ? "Save changes" : "Create prescription"}</button>
    </form>
  </aside>;
}

function EmptyState() { return <div className="px-6 py-14 text-center"><ClipboardList className="mx-auto size-8 text-[var(--brand)]" aria-hidden="true" /><p className="mt-4 font-semibold">No completed appointments yet</p><p className="mt-1 text-sm text-[var(--muted)]">Prescriptions can be created once an appointment is marked completed.</p></div>; }
