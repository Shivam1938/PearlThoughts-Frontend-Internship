// "use client";

// import type { ReactNode } from "react";
// import DoctorNavbar from "@/features/doctor/components/DoctorNavbar";

// export default function DoctorPortalShell({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]"><DoctorNavbar /><div className="pt-[88px]">{children}</div></div>; }

"use client";

import type { ReactNode } from "react";
import DoctorNavbar from "@/features/doctor/components/DoctorNavbar";
import { ChatbotWidget } from "@/components/chat/ChatbotWidget";

export default function DoctorPortalShell({ children }: { children: ReactNode }) {
  // Doctor context data (Aap ise props, context, ya API se replace kar sakte hain)
  const doctorData = {
    todayAppointments: 5,
    pendingConfirmations: 2,
    pendingPrescriptions: 1,
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] relative">
      <DoctorNavbar />
      <div className="pt-[88px]">{children}</div>
      
      {/* Floating Chatbot Widget for Doctor */}
      <ChatbotWidget portalType="doctor" contextData={doctorData} />
    </div>
  );
}