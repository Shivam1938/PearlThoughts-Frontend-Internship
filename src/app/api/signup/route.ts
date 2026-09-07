import { users } from "@/lib/mock-data/users";

type SignupBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

function isSignupBody(value: unknown): value is SignupBody {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (
    !isSignupBody(body) ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  if (users.some((user) => user.email === email)) {
    return Response.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = { id: `user-${Date.now()}`, email, password, name };
  users.push(user);

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name },
    token: `demo-token-${user.id}`,
  }, { status: 201 });
}