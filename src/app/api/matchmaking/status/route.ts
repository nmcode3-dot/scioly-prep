import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/matchmaking/status  (auth)
// Returns the current user's open request, and the matchId once someone accepts it.
export async function GET(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });
  await ensureSchema();
  const [r] = await db
    .select()
    .from(matchRequests)
    .where(and(eq(matchRequests.userId, user.id), eq(matchRequests.status, "matched")))
    .orderBy(matchRequests.id)
    .limit(1);
  return Response.json({ matchId: r?.matchId ?? null });
}
