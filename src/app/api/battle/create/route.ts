import { NextRequest } from "next/server";
import { isAiConfigured } from "@/lib/ai";
import { overridesFromHeaders } from "@/lib/ai-config";
import { createBattle, assignChallenge, BATTLE_SEASON } from "@/lib/battle-store";

export const dynamic = "force-dynamic";

// POST /api/battle/create
// Body: { myNickname, myEmoji, opponent:{nickname,emoji,isBot,skill}, eventName, division }
// Generates current-season questions and starts the battle. ~5–15s.
export async function POST(req: NextRequest) {
  if (!isAiConfigured(overridesFromHeaders(req.headers))) {
    return Response.json(
      { error: "Battles need the AI service to be configured (GROQ_API_KEY)." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const myNickname =
    typeof body.myNickname === "string" ? body.myNickname.trim().slice(0, 20) : "";
  const myEmoji =
    typeof body.myEmoji === "string" ? body.myEmoji : "🧑‍🚀";
  const eventName = typeof body.eventName === "string" ? body.eventName.trim() : "";
  const division = body.division === "C" ? "C" : "B";
  const opp = body.opponent as
    | { nickname?: string; emoji?: string; isBot?: boolean; skill?: number }
    | undefined;

  if (!myNickname || !eventName || !opp?.nickname) {
    return Response.json({ error: "Missing fields." }, { status: 400 });
  }

  try {
    const battle = await createBattle({
      myNickname,
      myEmoji,
      opponent: {
        nickname: opp.nickname,
        emoji: opp.emoji ?? "🤖",
        isBot: Boolean(opp.isBot),
        skill: typeof opp.skill === "number" ? opp.skill : 0.6,
      },
      eventName,
      division,
    });
    // If challenging a real (human) opponent, flag them so they auto-join.
    if (!opp.isBot) {
      assignChallenge(opp.nickname, eventName, division, battle.id);
    }
    return Response.json({ battleId: battle.id, season: BATTLE_SEASON });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start battle.";
    return Response.json({ error: message }, { status: 500 });
  }
}
