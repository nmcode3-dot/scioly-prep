import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromRequest, dbUnavailable } from "@/lib/auth";
import { judge, applyRating, type BattleQuestion, type BattleAnswer, type Judgment } from "@/lib/battle-client";

export const dynamic = "force-dynamic";

// GET /api/match/[id]  (auth)
// Returns the match for the viewer's side. While active, questions are sent
// WITHOUT correct answers (fair play). When finished, the full result is included.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (dbUnavailable()) return Response.json({ error: "Matchmaking requires a database (DATABASE_URL)." }, { status: 503 });
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });
  const { id } = await params;
  const matchId = Number(id);
  await ensureSchema();

  const [m] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!m) return Response.json({ error: "Match not found." }, { status: 404 });
  if (m.playerAId !== user.id && m.playerBId !== user.id) {
    return Response.json({ error: "You're not in this match." }, { status: 403 });
  }

  const iAmA = m.playerAId === user.id;
  const me = iAmA
    ? { id: m.playerAId, name: m.playerAName, emoji: m.playerAEmoji, rating: m.playerARating }
    : { id: m.playerBId, name: m.playerBName, emoji: m.playerBEmoji, rating: m.playerBRating };
  const opp = iAmA
    ? { id: m.playerBId, name: m.playerBName, emoji: m.playerBEmoji, rating: m.playerBRating }
    : { id: m.playerAId, name: m.playerAName, emoji: m.playerAEmoji, rating: m.playerARating };

  const questions = m.questions as unknown as BattleQuestion[];

  if (m.status === "finished") {
    const answersA = (m.answersA ?? []) as unknown as BattleAnswer[];
    const answersB = (m.answersB ?? []) as unknown as BattleAnswer[];
    const j = judge(answersA, {
      eventName: m.eventName, division: m.division, season: m.season, questions,
      home: { nickname: m.playerAName, emoji: m.playerAEmoji },
      away: { nickname: m.playerBName, emoji: m.playerBEmoji, isBot: false, skill: 0, rating: m.playerBRating, answers: answersB },
    });
    const myChange = applyRating(me.rating, opp.rating, iAmA ? j : flip(j));
    return Response.json({
      id: m.id, eventName: m.eventName, division: m.division, season: m.season,
      status: "finished",
      me: { ...me, submitted: true },
      opp: { ...opp, submitted: true },
      questions, // includes correct answers for the results reveal
      judgment: iAmA ? j : flip(j),
      ratingChange: myChange,
    });
  }

  // Active: send questions WITHOUT correct answers for fair play.
  return Response.json({
    id: m.id, eventName: m.eventName, division: m.division, season: m.season,
    status: "active",
    me: { ...me, submitted: iAmA ? m.submittedA : m.submittedB },
    opp: { ...opp, submitted: iAmA ? m.submittedB : m.submittedA },
    questions: questions.map((q) => ({ prompt: q.prompt, options: q.options, topic: q.topic })),
  });
}

/** Flip a judgment to the other player's perspective. */
function flip(j: Judgment): Judgment {
  return {
    homeCorrect: j.awayCorrect,
    awayCorrect: j.homeCorrect,
    homeTime: j.awayTime,
    awayTime: j.homeTime,
    winner: j.winner === "home" ? "away" : j.winner === "away" ? "home" : "tie",
  };
}
