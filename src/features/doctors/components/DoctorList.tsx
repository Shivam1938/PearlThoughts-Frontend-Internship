"use client";

import { useMemo, useState } from "react";
import DoctorCard from "@/features/doctors/components/DoctorCard";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import type { Doctor } from "@/types/doctor";

type Filters = {
  search: string;
  specialty: string;
  city: string;
};

const initialFilters: Filters = { search: "", specialty: "all", city: "all" };

export default function DoctorList() {
  const { doctors, isLoading, error } = useDoctors();
  const [draftFilters, setDraftFilters] = useState<Filters>(initialFilters);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const specialties = useMemo(() => uniqueValues(doctors, "specialty"), [doctors]);
  const cities = useMemo(() => uniqueValues(doctors, "city"), [doctors]);
  const filteredDoctors = useMemo(() => filterDoctors(doctors, filters), [doctors, filters]);

  function updateFilter(key: keyof Filters, value: string): void {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(): void {
    setFilters(draftFilters);
  }

  if (isLoading) return <StatePanel message="Loading doctors..." />;
  if (error) return <StatePanel message={error} isError />;
  if (doctors.length === 0) return <StatePanel message="No doctors are available right now." />;

  return (
    <>
      <form
        className="mb-8 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <label className="text-sm font-medium">
          Doctor or specialty
          <input
            className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 font-normal outline-none focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="Search by doctor name or specialty"
            value={draftFilters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
        </label>
        <label className="text-sm font-medium">
          Specialty
          <select className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 font-normal outline-none focus:border-[var(--brand)]" value={draftFilters.specialty} onChange={(event) => updateFilter("specialty", event.target.value)}>
            <option value="all">All specialties</option>
            {specialties.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Location
          <select className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2.5 font-normal outline-none focus:border-[var(--brand)]" value={draftFilters.city} onChange={(event) => updateFilter("city", event.target.value)}>
            <option value="all">All cities</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <button className="rounded-lg bg-[var(--brand)] px-4 py-2.5 font-semibold text-white hover:bg-[var(--brand-deep)]" type="submit">Find Doctors</button>
      </form>

      {filteredDoctors.length === 0 ? (
        <StatePanel message="No doctors match those filters." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
        </div>
      )}
    </>
  );
}

function uniqueValues(doctors: Doctor[], key: "specialty" | "city"): string[] {
  return Array.from(new Set(doctors.map((doctor) => doctor[key]))).sort();
}

function filterDoctors(doctors: Doctor[], filters: Filters): Doctor[] {
  const search = filters.search.trim().toLowerCase();
  return doctors.filter((doctor) => {
    const matchesSearch = !search || `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(search);
    const matchesSpecialty = filters.specialty === "all" || doctor.specialty === filters.specialty;
    const matchesCity = filters.city === "all" || doctor.city === filters.city;
    return matchesSearch && matchesSpecialty && matchesCity;
  });
}

type StatePanelProps = { message: string; isError?: boolean };

function StatePanel({ message, isError = false }: StatePanelProps) {
  return <section className={`rounded-2xl border p-8 text-center ${isError ? "border-red-200 bg-red-50 text-red-800" : "border-[var(--line)] bg-white text-[var(--muted)]"}`} role={isError ? "alert" : undefined}>{message}</section>;
}
