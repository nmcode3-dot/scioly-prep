import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchChallenges } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/matchmaking/incoming  (auth)
// Pending challenges sent TO me that I can accept or decline.
export async function GET(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });
  await ensureSchema();
  const rows = await db
    .select()
    .from(matchChallenges)
    .where(and(eq(matchChallenges.toUserId, user.id), eq(matchChallenges.status, "pending")))
    .orderBy(desc(matchChallenges.createdAt))
    .limit(10);
  return Response.json({
    challenges: rows.map((r) => ({
      id: r.id,
      fromUsername: r.fromUsername,
      fromEmoji: r.fromEmoji,
      eventName: r.eventName,
      division: r.division,
      createdAt: r.createdAt,
    })),
  });
}
