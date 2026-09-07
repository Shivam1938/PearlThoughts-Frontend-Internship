import type { Metadata } from "next";
import AuthGate from "@/features/auth/components/AuthGate";
import { AuthProvider } from "@/features/auth/hooks/auth-context";
import { DoctorAuthProvider } from "@/features/doctor/hooks/doctor-auth-context";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseCare | Appointment operations starter",
  description: "A production-minded starter for PulseCare doctor appointment booking workflows.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <DoctorAuthProvider><AuthGate>{children}</AuthGate></DoctorAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
