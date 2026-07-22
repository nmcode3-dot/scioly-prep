import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchChallenges } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/matchmaking/outgoing  (auth)
// The current user's most recent outgoing challenge status, so the sender can
// detect when it's accepted (matchId) or declined.
export async function GET(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });
  await ensureSchema();
  const [ch] = await db
    .select()
    .from(matchChallenges)
    .where(and(eq(matchChallenges.fromUserId, user.id)))
    .orderBy(desc(matchChallenges.createdAt))
    .limit(1);
  if (!ch) return Response.json({ challenge: null });
  return Response.json({
    challenge: {
      id: ch.id,
      toUsername: ch.toUsername,
      eventName: ch.eventName,
      status: ch.status,
      matchId: ch.matchId,
    },
  });
}
