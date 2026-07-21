import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/matchmaking/cancel  (auth) — remove my open request.
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ ok: true });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ ok: true });
  await ensureSchema();
  await db.delete(matchRequests).where(and(eq(matchRequests.userId, user.id), eq(matchRequests.status, "open")));
  return Response.json({ ok: true });
}
