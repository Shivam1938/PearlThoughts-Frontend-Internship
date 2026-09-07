import type { LoginRequest, LoginResponse } from "@/features/auth/types";

type LoginErrorResponse = {
  error: string;
};

function isLoginResponse(value: unknown): value is LoginResponse {
  if (typeof value !== "object" || value === null) return false;

  const response = value as Record<string, unknown>;
  const user = response.user;

  if (typeof user !== "object" || user === null) return false;

  const responseUser = user as Record<string, unknown>;
  return (
    typeof responseUser.id === "string" &&
    typeof responseUser.email === "string" &&
    typeof responseUser.name === "string" &&
    typeof response.token === "string"
  );
}

function isLoginErrorResponse(value: unknown): value is LoginErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).error === "string"
  );
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const request: LoginRequest = { email, password };
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body: unknown = await response.json();

  if (!response.ok) {
    if (isLoginErrorResponse(body)) throw new Error(body.error);
    throw new Error("Unable to log in");
  }

  if (!isLoginResponse(body)) throw new Error("Login response was invalid");
  return body;
}