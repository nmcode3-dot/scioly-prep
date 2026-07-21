import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchRequests, matches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";
import { generateQuestions } from "@/lib/ai";
import { BATTLE_QUESTIONS, BATTLE_SEASON } from "@/lib/battle-client";

export const dynamic = "force-dynamic";

// POST /api/matchmaking/challenge  { requestId }  (auth)
// Accept someone's open challenge → create a shared human match.
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid body." }, { status: 400 }); }
  const requestId = Number(body.requestId);
  if (!Number.isFinite(requestId)) return Response.json({ error: "Invalid request." }, { status: 400 });

  await ensureSchema();

  const [open] = await db
    .select()
    .from(matchRequests)
    .where(and(eq(matchRequests.id, requestId), eq(matchRequests.status, "open")))
    .limit(1);
  if (!open) return Response.json({ error: "That challenge was already taken or cancelled." }, { status: 409 });
  if (open.userId === user.id) return Response.json({ error: "You can't accept your own challenge." }, { status: 400 });

  // Atomically claim it (status open -> matched); only one claimant wins.
  const claimed = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(matchRequests)
      .set({ status: "matched" })
      .where(and(eq(matchRequests.id, requestId), eq(matchRequests.status, "open")))
      .returning();
    return row;
  });
  if (!claimed) return Response.json({ error: "That challenge was already taken." }, { status: 409 });

  // Generate shared questions (current-season rules).
  let questions;
  try {
    const { questions: ai } = await generateQuestions({
      eventName: open.eventName,
      division: open.division,
      difficulty: "medium",
      count: BATTLE_QUESTIONS,
      season: BATTLE_SEASON,
    });
    questions = ai.map((q) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, topic: q.topic }));
  } catch {
    return Response.json({ error: "Couldn't generate questions. Try again." }, { status: 502 });
  }

  const [match] = await db
    .insert(matches)
    .values({
      eventName: open.eventName,
      division: open.division,
      season: BATTLE_SEASON,
      questions,
      playerAId: open.userId,
      playerAName: open.username,
      playerAEmoji: open.emoji,
      playerARating: open.rating,
      playerBId: user.id,
      playerBName: user.username,
      playerBEmoji: user.emoji,
      playerBRating: user.rating,
    })
    .returning({ id: matches.id });

  await db.update(matchRequests).set({ matchId: match.id }).where(eq(matchRequests.id, requestId));
  // Clean up any of my own open requests.
  await db.delete(matchRequests).where(and(eq(matchRequests.userId, user.id), eq(matchRequests.status, "open")));

  return Response.json({ matchId: match.id });
}
