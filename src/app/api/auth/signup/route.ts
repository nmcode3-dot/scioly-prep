import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  validateUsername,
  validatePassword,
  createSession,
  toPublicUser,
  sessionCookieHeader,
  dbUnavailable,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/signup  { username, password, emoji? }
export async function POST(req: NextRequest) {
  if (dbUnavailable()) {
    return Response.json(
      { error: "Accounts require a database. Set DATABASE_URL to enable sign-up." },
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
  const emoji =
    typeof body.emoji === "string" && body.emoji.trim() ? body.emoji : "🦊";

  const userErr = validateUsername(username);
  if (userErr) return Response.json({ error: userErr }, { status: 400 });
  const passErr = validatePassword(password);
  if (passErr) return Response.json({ error: passErr }, { status: 400 });

  await ensureSchema();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existing) {
    return Response.json({ error: "That username is taken." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash, emoji, rating: 1000 })
    .returning();

  const token = await createSession(user.id);
  return Response.json(
    { user: toPublicUser(user) },
    { status: 201, headers: { "set-cookie": sessionCookieHeader(token) } },
  );
}
