import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  createSession,
  toPublicUser,
  sessionCookieHeader,
  dbUnavailable,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/login  { username, password }
export async function POST(req: NextRequest) {
  if (dbUnavailable()) {
    return Response.json(
      { error: "Accounts require a database. Set DATABASE_URL to enable login." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return Response.json({ error: "Enter your username and password." }, { status: 400 });
  }

  await ensureSchema();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!user) {
    return Response.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return Response.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  const token = await createSession(user.id);
  return Response.json(
    { user: toPublicUser(user) },
    { headers: { "set-cookie": sessionCookieHeader(token) } },
  );
}
