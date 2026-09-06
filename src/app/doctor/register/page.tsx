import AuthShell from "@/features/auth/components/AuthShell";
import DoctorRegistrationForm from "@/features/doctor/components/DoctorRegistrationForm";

export default function DoctorRegistrationPage() {
  return <AuthShell layout="wide"><DoctorRegistrationForm /></AuthShell>;
}
