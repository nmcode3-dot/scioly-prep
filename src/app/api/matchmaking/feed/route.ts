import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchRequests } from "@/db/schema";
import { eq, ne, desc, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/matchmaking/feed  (auth)
// All OPEN challenges across every event/topic, excluding your own. Polled every 3s.
export async function GET(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });
  await ensureSchema();
  const rows = await db
    .select()
    .from(matchRequests)
    .where(and(eq(matchRequests.status, "open"), ne(matchRequests.userId, user.id)))
    .orderBy(desc(matchRequests.createdAt))
    .limit(40);
  const requests = rows.map((r) => ({
    id: r.id,
    username: r.username,
    emoji: r.emoji,
    rating: r.rating,
    eventName: r.eventName,
    division: r.division,
    createdAt: r.createdAt,
  }));
  return Response.json({ requests });
}
