import type { Doctor } from "@/types/doctor";

type DoctorCardProps = {
  doctor: Doctor;
};

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <img
          src={doctor.photo}
          alt={doctor.name}
          className="size-16 shrink-0 rounded-xl object-cover ring-4 ring-[var(--brand-soft)]"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{doctor.name}</h2>
          <span className="mt-1 inline-block rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand)]">
            {doctor.specialty}
          </span>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {doctor.city} · {doctor.experience} years experience
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Patient satisfaction</p>
          <p className="mt-1 text-sm font-semibold">{doctor.patientSatisfaction}% recommended</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Reviews</p>
          <p className="mt-1 text-sm font-semibold">{doctor.reviewCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-[var(--line)] pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Consultation fee</p>
          <p className="mt-1 text-xl font-semibold">₹{doctor.fee}</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-semibold text-amber-700" aria-label={`${doctor.rating} out of 5 stars`}>
          ★ {doctor.rating.toFixed(1)}
        </div>
      </div>
    </article>
  );
}
