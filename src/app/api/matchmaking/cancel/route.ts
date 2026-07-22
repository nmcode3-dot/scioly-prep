import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchRequests, matchChallenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/matchmaking/cancel  (auth)
// Cancel my open host request and/or my pending outgoing challenge.
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ ok: true });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ ok: true });
  await ensureSchema();
  await db.delete(matchRequests).where(and(eq(matchRequests.userId, user.id), eq(matchRequests.status, "open")));
  await db.delete(matchChallenges).where(and(eq(matchChallenges.fromUserId, user.id), eq(matchChallenges.status, "pending")));
  return Response.json({ ok: true });
}
