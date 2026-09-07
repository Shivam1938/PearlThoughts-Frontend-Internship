import SignupForm from "@/features/auth/components/SignupForm";
import AuthShell from "@/features/auth/components/AuthShell";

export default function SignupPage() {
  return <AuthShell><SignupForm /></AuthShell>;
}