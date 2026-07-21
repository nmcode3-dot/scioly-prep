import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";
import { applyRating, type Judgment } from "@/lib/battle-client";

export const dynamic = "force-dynamic";

// POST /api/battle/result  { oppRating, judgment }  (auth)
// Applies an Elo rating change to the logged-in user after a bot battle.
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Rating requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid body." }, { status: 400 }); }
  const oppRating = typeof body.oppRating === "number" ? body.oppRating : 1000;
  const j = body.judgment as Judgment | undefined;

  if (!j || typeof j.homeCorrect !== "number") {
    return Response.json({ error: "Missing result." }, { status: 400 });
  }

  await ensureSchema();
  const change = applyRating(user.rating, oppRating, j);
  await db.update(users).set({ rating: change.newRating }).where(eq(users.id, user.id));
  return Response.json({ ratingChange: change });
}
