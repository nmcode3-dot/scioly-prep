import { NextRequest } from "next/server";
import { getBattle, viewFor, judge, type BattleSide } from "@/lib/battle-store";

export const dynamic = "force-dynamic";

// GET /api/battle/[id]?side=home|away
// Returns the sanitized battle state for the viewer's side.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const battle = getBattle(id);
  if (!battle) {
    return Response.json({ error: "Battle not found." }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const side = (searchParams.get("side") === "away" ? "away" : "home") as BattleSide;

  const view = viewFor(battle, side);
  const judgment = battle.status === "finished" ? judge(battle) : null;
  return Response.json({ ...view, judgment });
}
