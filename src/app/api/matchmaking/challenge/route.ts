import { NextRequest } from "next/server";
import { db, ensureSchema, cleanupStaleData } from "@/db";
import { matchRequests, matchChallenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/matchmaking/challenge  { requestId }  (auth)
// Send a directed challenge to a player who has an open request. They must
// ACCEPT before a match is created.
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid body." }, { status: 400 }); }
  const requestId = Number(body.requestId);
  if (!Number.isFinite(requestId)) return Response.json({ error: "Invalid request." }, { status: 400 });

  await ensureSchema();
  cleanupStaleData().catch(() => {});

  const [host] = await db
    .select()
    .from(matchRequests)
    .where(and(eq(matchRequests.id, requestId), eq(matchRequests.status, "open")))
    .limit(1);
  if (!host) return Response.json({ error: "That player is no longer available." }, { status: 409 });
  if (host.userId === user.id) return Response.json({ error: "You can't challenge yourself." }, { status: 400 });

  // Replace any pending outgoing challenge of mine.
  await db.delete(matchChallenges).where(and(eq(matchChallenges.fromUserId, user.id), eq(matchChallenges.status, "pending")));
  const [ch] = await db
    .insert(matchChallenges)
    .values({
      fromUserId: user.id,
      fromUsername: user.username,
      fromEmoji: user.emoji,
      toUserId: host.userId,
      toUsername: host.username,
      eventName: host.eventName,
      division: host.division,
      status: "pending",
    })
    .returning({ id: matchChallenges.id });
  // I'm now busy waiting — remove my own open request if any.
  await db.delete(matchRequests).where(and(eq(matchRequests.userId, user.id), eq(matchRequests.status, "open")));

  return Response.json({ challengeId: ch.id, toUsername: host.username, eventName: host.eventName });
}
