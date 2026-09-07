// "use client";

// import type { ReactNode } from "react";
// import AppNavbar from "@/components/layout/AppNavbar";

// type AuthenticatedShellProps = {
//   children: ReactNode;
// };

// export default function AuthenticatedShell({ children }: AuthenticatedShellProps) {
//   return (
//     <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
//       <AppNavbar />
//       <div className="pt-[88px]">{children}</div>
//     </div>
//   );
// }

"use client";

import type { ReactNode } from "react";
import AppNavbar from "@/components/layout/AppNavbar";
import { ChatbotWidget } from "@/components/chat/ChatbotWidget";

type AuthenticatedShellProps = {
  children: ReactNode;
};

export default function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  // Sample/Initial context data for user
  const userData = {
    role: "patient",
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] relative">
      <AppNavbar />
      <div className="pt-[88px]">{children}</div>

      {/* User / Patient Portal Chatbot Widget */}
      <ChatbotWidget portalType="user" contextData={userData} />
    </div>
  );
}