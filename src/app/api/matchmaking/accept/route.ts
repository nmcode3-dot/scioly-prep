import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matchChallenges, matches, matchRequests, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";
import { generateQuestions } from "@/lib/ai";
import { BATTLE_QUESTIONS, BATTLE_SEASON } from "@/lib/battle-client";

export const dynamic = "force-dynamic";

// POST /api/matchmaking/accept  { challengeId }  (auth)
// Accept a challenge directed at me → create the match. Both players then
// redirect into it (me now, the sender via their outgoing-status poll).
export async function POST(req: NextRequest) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid body." }, { status: 400 }); }
  const challengeId = Number(body.challengeId);
  if (!Number.isFinite(challengeId)) return Response.json({ error: "Invalid challenge." }, { status: 400 });

  await ensureSchema();

  // Atomically claim the challenge (pending -> accepted); only the recipient wins.
  const [claimed] = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(matchChallenges)
      .set({ status: "accepted" })
      .where(and(eq(matchChallenges.id, challengeId), eq(matchChallenges.status, "pending")))
      .returning();
    return [row];
  });
  if (!claimed) return Response.json({ error: "That challenge is no longer available." }, { status: 409 });
  if (claimed.toUserId !== user.id) return Response.json({ error: "This challenge isn't for you." }, { status: 403 });

  // Load both players' current ratings for the match snapshot.
  const [fromUser] = await db.select().from(users).where(eq(users.id, claimed.fromUserId)).limit(1);
  const [toUser] = await db.select().from(users).where(eq(users.id, claimed.toUserId)).limit(1);
  if (!fromUser || !toUser) return Response.json({ error: "Player not found." }, { status: 404 });

  // Generate shared questions (current-season rules).
  let questions;
  try {
    const { questions: ai } = await generateQuestions({
      eventName: claimed.eventName,
      division: claimed.division,
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
      eventName: claimed.eventName,
      division: claimed.division,
      season: BATTLE_SEASON,
      questions,
      playerAId: fromUser.id,
      playerAName: fromUser.username,
      playerAEmoji: fromUser.emoji,
      playerARating: fromUser.rating,
      playerBId: toUser.id,
      playerBName: toUser.username,
      playerBEmoji: toUser.emoji,
      playerBRating: toUser.rating,
    })
    .returning({ id: matches.id });

  await db.update(matchChallenges).set({ matchId: match.id }).where(eq(matchChallenges.id, challengeId));
  // Clean up: decline other pending challenges to me, remove my open request.
  await db.delete(matchChallenges).where(and(eq(matchChallenges.toUserId, user.id), eq(matchChallenges.status, "pending")));
  await db.delete(matchRequests).where(and(eq(matchRequests.userId, user.id), eq(matchRequests.status, "open")));
  // Decline the sender's other outgoing challenges too.
  await db.delete(matchChallenges).where(and(eq(matchChallenges.fromUserId, fromUser.id), eq(matchChallenges.status, "pending")));

  return Response.json({ matchId: match.id });
}
