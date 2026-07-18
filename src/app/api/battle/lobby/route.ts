import { NextRequest } from "next/server";
import { joinLobby, listOpponents, heartbeatLobby, leaveLobby, getPendingBattle } from "@/lib/battle-store";

export const dynamic = "force-dynamic";

const EMOJIS = ["🦊", "🐼", "🐧", "🦁", "🐸", "🐙", "🦄", "🐯", "🦉", "🐲"];

// GET /api/battle/lobby?event=...&division=...&lobbyId=...
// Returns the opponents available to challenge for this event/division.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const event = searchParams.get("event") ?? "";
  const division = searchParams.get("division") === "C" ? "C" : "B";
  const lobbyId = searchParams.get("lobbyId") ?? "";

  let challengedBattleId: string | null = null;
  if (lobbyId) {
    heartbeatLobby(lobbyId);
    challengedBattleId = getPendingBattle(lobbyId);
  }

  const { bots, players } = listOpponents(event, division);
  return Response.json({ bots, players, challengedBattleId });
}

// POST /api/battle/lobby { nickname, emoji, event, division }
// Join the lobby (so others could challenge you) and get a lobbyId.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }
  const nickname =
    typeof body.nickname === "string" ? body.nickname.trim().slice(0, 20) : "";
  if (!nickname) {
    return Response.json({ error: "Nickname required." }, { status: 400 });
  }
  const emoji =
    typeof body.emoji === "string" ? body.emoji : EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const eventName = typeof body.event === "string" ? body.event : "";
  const division = body.division === "C" ? "C" : "B";
  if (!eventName) {
    return Response.json({ error: "Event required." }, { status: 400 });
  }

  const lobbyId = joinLobby({ nickname, emoji, eventName, division });
  return Response.json({ lobbyId, nickname, emoji });
}

// DELETE /api/battle/lobby?lobbyId=...
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lobbyId = searchParams.get("lobbyId") ?? "";
  if (lobbyId) leaveLobby(lobbyId);
  return Response.json({ ok: true });
}
