import { doctors } from "@/lib/mock-data/doctors";
import { doctorAccounts } from "@/lib/mock-data/doctor-accounts";

function accountToDoctor(account: (typeof doctorAccounts)[number]) {
  return {
    id: account.id,
    name: account.name,
    specialty: account.specialization,
    city: account.clinicAddress.split(",").pop()?.trim() || "Clinic location",
    photo: account.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80",
    age: account.age,
    rating: 0,
    fee: 500,
    experience: account.experienceYears,
    patientSatisfaction: 0,
    reviewCount: 0,
  };
}

export async function GET() {
  const registeredDoctors = doctorAccounts.map(accountToDoctor);
  return Response.json({
    data: [...doctors, ...registeredDoctors],
    meta: { total: doctors.length + registeredDoctors.length },
  });
}
