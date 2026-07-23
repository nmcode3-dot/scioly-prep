import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matches, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";
import { judge, applyRating, type BattleQuestion, type BattleAnswer } from "@/lib/battle-client";

export const dynamic = "force-dynamic";

// POST /api/match/[id]/submit  { answers: [{selectedIndex, timeMs}] }  (auth)
// Records this player's answers; once BOTH have submitted, judges + updates ratings.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });
  const { id } = await params;
  const matchId = Number(id);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid body." }, { status: 400 }); }
  const rawAnswers = Array.isArray(body.answers) ? body.answers : [];

  await ensureSchema();
  const [m] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!m) return Response.json({ error: "Match not found." }, { status: 404 });
  if (m.playerAId !== user.id && m.playerBId !== user.id) {
    return Response.json({ error: "You're not in this match." }, { status: 403 });
  }
  const iAmA = m.playerAId === user.id;
  if (iAmA && m.submittedA) return Response.json({ error: "Already submitted.", waiting: !m.submittedB }, { status: 409 });
  if (!iAmA && m.submittedB) return Response.json({ error: "Already submitted.", waiting: !m.submittedA }, { status: 409 });

  const questions = m.questions as unknown as BattleQuestion[];
  const answers: BattleAnswer[] = questions.map((q, i) => {
    const a = rawAnswers[i] as { selectedIndex?: number; timeMs?: number } | undefined;
    const selectedIndex = a && typeof a.selectedIndex === "number" ? Math.round(a.selectedIndex) : -1;
    const timeMs = a && typeof a.timeMs === "number" && a.timeMs > 0 ? Math.round(a.timeMs) : 999999;
    return { selectedIndex, timeMs };
  });
  // Indices this player reported + got upheld (disregarded from scoring).
  const disregard = Array.isArray(body.disregard)
    ? body.disregard.filter((x) => typeof x === "number").map((x) => Math.round(x as number))
    : [];

  await db
    .update(matches)
    .set(iAmA ? { answersA: answers, disregardA: disregard, submittedA: true } : { answersB: answers, disregardB: disregard, submittedB: true })
    .where(eq(matches.id, matchId));

  // Reload to check both submitted.
  const [m2] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!m2 || !m2.submittedA || !m2.submittedB) {
    return Response.json({ finished: false });
  }

  // Both done → judge + update both ratings, disregarding any upheld reports.
  const answersA = (m2.answersA ?? []) as unknown as BattleAnswer[];
  const answersB = (m2.answersB ?? []) as unknown as BattleAnswer[];
  const disregarded = new Set<number>([
    ...((m2.disregardA as unknown as number[] | null) ?? []),
    ...((m2.disregardB as unknown as number[] | null) ?? []),
  ]);
  const keepIdx = questions.map((_, i) => i).filter((i) => !disregarded.has(i));
  const scoredQuestions = keepIdx.length ? keepIdx.map((i) => questions[i]) : questions;
  const scoredA = (keepIdx.length ? keepIdx.map((i) => answersA[i]) : answersA) ?? [];
  const scoredB = (keepIdx.length ? keepIdx.map((i) => answersB[i]) : answersB) ?? [];

  const j = judge(scoredA, {
    eventName: m2.eventName, division: m2.division, season: m2.season, questions: scoredQuestions,
    home: { nickname: m2.playerAName, emoji: m2.playerAEmoji },
    away: { nickname: m2.playerBName, emoji: m2.playerBEmoji, isBot: false, skill: 0, rating: m2.playerBRating, answers: scoredB },
  });

  const changeA = applyRating(m2.playerARating, m2.playerBRating, j);
  const changeB = applyRating(m2.playerBRating, m2.playerARating, {
    homeCorrect: j.awayCorrect, awayCorrect: j.homeCorrect, homeTime: j.awayTime, awayTime: j.homeTime,
    winner: j.winner === "home" ? "away" : j.winner === "away" ? "home" : "tie",
  });

  await db.transaction(async (tx) => {
    await tx.update(matches).set({ status: "finished" }).where(eq(matches.id, matchId));
    await tx.update(users).set({ rating: changeA.newRating }).where(eq(users.id, m2.playerAId));
    await tx.update(users).set({ rating: changeB.newRating }).where(eq(users.id, m2.playerBId));
  });

  return Response.json({ finished: true });
}
