import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchChallenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/matchmaking/decline  { challengeId }  (auth)
// Decline a challenge directed at me.
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ ok: true });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ ok: true });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid body." }, { status: 400 }); }
  const challengeId = Number(body.challengeId);
  await ensureSchema();
  await db
    .update(matchChallenges)
    .set({ status: "declined" })
    .where(and(eq(matchChallenges.id, challengeId), eq(matchChallenges.toUserId, user.id), eq(matchChallenges.status, "pending")));
  return Response.json({ ok: true });
}
