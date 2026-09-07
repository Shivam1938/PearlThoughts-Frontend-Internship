import type { SignupRequest, SignupResponse } from "@/features/auth/types";

type SignupErrorResponse = {
  error: string;
};

function isSignupResponse(value: unknown): value is SignupResponse {
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

function isSignupErrorResponse(value: unknown): value is SignupErrorResponse {
  return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>).error === "string";
}

export async function signup(name: string, email: string, password: string): Promise<SignupResponse> {
  const request: SignupRequest = { name, email, password };
  const response = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body: unknown = await response.json();

  if (!response.ok) {
    if (isSignupErrorResponse(body)) throw new Error(body.error);
    throw new Error("Unable to create account");
  }

  if (!isSignupResponse(body)) throw new Error("Signup response was invalid");
  return body;
}