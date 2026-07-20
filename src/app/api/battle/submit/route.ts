import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { battles, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";
import {
  judge,
  applyRating,
  type BattleAnswer,
  type BattleQuestion,
  type Judgment,
} from "@/lib/battle-client";

export const dynamic = "force-dynamic";

export interface SubmittedJudgment extends Judgment {
  ratingChange: { delta: number; oldRating: number; newRating: number };
}

// POST /api/battle/submit  (auth required)
// Body: { battleId, answers: [{ selectedIndex, timeMs }] }
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "You must be logged in." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const battleId = Number(body.battleId);
  const rawAnswers = Array.isArray(body.answers) ? body.answers : [];

  if (!Number.isFinite(battleId) || battleId <= 0) {
    return Response.json({ error: "Invalid battle." }, { status: 400 });
  }

  await ensureSchema();

  // Load the battle, scoped to THIS user (prevents submitting others' battles).
  const [battle] = await db
    .select()
    .from(battles)
    .where(and(eq(battles.id, battleId), eq(battles.userId, user.id)))
    .limit(1);

  if (!battle) {
    return Response.json({ error: "Battle not found." }, { status: 404 });
  }
  if (battle.status === "done") {
    return Response.json({ error: "This battle was already submitted." }, { status: 409 });
  }

  const questions = battle.questions as unknown as BattleQuestion[];
  const botAnswers = battle.botAnswers as unknown as BattleAnswer[];

  const homeAnswers: BattleAnswer[] = questions.map((q, i) => {
    const a = rawAnswers[i] as { selectedIndex?: number; timeMs?: number } | undefined;
    const selectedIndex =
      a && typeof a.selectedIndex === "number" ? Math.round(a.selectedIndex) : -1;
    const timeMs =
      a && typeof a.timeMs === "number" && a.timeMs > 0 ? Math.round(a.timeMs) : 999999;
    return { selectedIndex, timeMs };
  });

  const j = judge(homeAnswers, {
    eventName: battle.eventName,
    division: battle.division,
    season: battle.season,
    questions,
    home: { nickname: user.username, emoji: user.emoji },
    away: {
      nickname: battle.oppName,
      emoji: battle.oppEmoji,
      isBot: true,
      skill: 0,
      rating: battle.oppRating,
      answers: botAnswers,
    },
  });

  const change = applyRating(user.rating, battle.oppRating, j);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ rating: change.newRating })
      .where(eq(users.id, user.id));
    await tx
      .update(battles)
      .set({ status: "done" })
      .where(eq(battles.id, battleId));
  });

  return Response.json({
    judgment: j,
    ratingChange: change,
  });
}
