import type { User } from "@/features/auth/types";

export type AuthSession = {
  user: User;
  token: string;
};

const SESSION_KEY = "schedula.auth.session";

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== "object" || value === null) return false;

  const session = value as Record<string, unknown>;
  const user = session.user;
  if (typeof session.token !== "string" || typeof user !== "object" || user === null) return false;

  const sessionUser = user as Record<string, unknown>;
  return (
    typeof sessionUser.id === "string" &&
    typeof sessionUser.email === "string" &&
    typeof sessionUser.name === "string"
  );
}

export function saveSession(session: AuthSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): AuthSession | null {
  const storedSession = window.localStorage.getItem(SESSION_KEY);
  if (!storedSession) return null;

  try {
    const parsedSession: unknown = JSON.parse(storedSession);
    if (!isAuthSession(parsedSession)) {
      clearSession();
      return null;
    }
    return parsedSession;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}