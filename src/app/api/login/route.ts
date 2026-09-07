import { users } from "@/lib/mock-data/users";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function isLoginBody(value: unknown): value is LoginBody {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!isLoginBody(body) || typeof body.email !== "string" || typeof body.password !== "string") {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const email = body.email;
  const password = body.password;
  const user = users.find(
    (candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password,
  );

  if (!user && !users.some((candidate) => candidate.email === email.trim().toLowerCase())) {
    return Response.json({ error: "No account found, please sign up" }, { status: 404 });
  }

  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name },
    token: `demo-token-${user.id}`,
  });
}