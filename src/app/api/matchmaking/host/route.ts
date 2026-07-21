import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/matchmaking/host  { eventName, division }  (auth)
// Post an open "looking for a match" request to the board.
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid body." }, { status: 400 }); }
  const eventName = typeof body.eventName === "string" ? body.eventName.trim() : "";
  const division = body.division === "C" ? "C" : "B";
  if (!eventName) return Response.json({ error: "Pick an event." }, { status: 400 });

  await ensureSchema();
  // Replace any existing open request for this user.
  await db.delete(matchRequests).where(and(eq(matchRequests.userId, user.id), eq(matchRequests.status, "open")));
  const [req2] = await db
    .insert(matchRequests)
    .values({ userId: user.id, username: user.username, emoji: user.emoji, rating: user.rating, eventName, division, status: "open" })
    .returning();
  return Response.json({ request: { id: req2.id, eventName, division } });
}
