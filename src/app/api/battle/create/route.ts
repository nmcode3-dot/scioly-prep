import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { battles } from "@/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import { generateQuestions } from "@/lib/ai";
import {
  BATTLE_QUESTIONS,
  BATTLE_SEASON,
  botRating,
  simulateBot,
  type BattleQuestion,
  type BattleAnswer,
} from "@/lib/battle-client";

export const dynamic = "force-dynamic";

// POST /api/battle/create  (auth required)
// Body: { opponent: { nickname, emoji, skill, isBot }, eventName, division }
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "You must be logged in to battle." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const opp = body.opponent as
    | { nickname?: string; emoji?: string; skill?: number; isBot?: boolean }
    | undefined;
  const eventName = typeof body.eventName === "string" ? body.eventName.trim() : "";
  const division = body.division === "C" ? "C" : "B";

  if (!opp?.nickname || !eventName) {
    return Response.json({ error: "Missing opponent or event." }, { status: 400 });
  }
  const skill = typeof opp.skill === "number" ? opp.skill : 0.6;

  await ensureSchema();

  // Generate current-season questions via AI.
  let questions: BattleQuestion[];
  try {
    const { questions: ai } = await generateQuestions({
      eventName,
      division,
      difficulty: "medium",
      count: BATTLE_QUESTIONS,
      season: BATTLE_SEASON,
    });
    questions = ai.map((q) => ({
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      topic: q.topic,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: msg }, { status: 502 });
  }

  if (questions.length === 0) {
    return Response.json({ error: "Couldn't generate questions. Try another event." }, { status: 502 });
  }

  const botAnswers: BattleAnswer[] = simulateBot(questions, skill);
  const oppRating = botRating(skill);

  const [row] = await db
    .insert(battles)
    .values({
      userId: user.id,
      eventName,
      division,
      season: BATTLE_SEASON,
      oppName: opp.nickname,
      oppEmoji: opp.emoji ?? "🤖",
      oppRating,
      questions,
      botAnswers,
    })
    .returning({ id: battles.id });

  return Response.json({
    battleId: row.id,
    eventName,
    division,
    season: BATTLE_SEASON,
    questions,
    opponent: {
      nickname: opp.nickname,
      emoji: opp.emoji ?? "🤖",
      rating: oppRating,
      isBot: true,
    },
    botAnswers,
  });
}
