import { NextRequest } from "next/server";
import { submitAnswer, getBattle, viewFor, type BattleSide } from "@/lib/battle-store";

export const dynamic = "force-dynamic";

// POST /api/battle/[id]/answer
// Body: { side, selectedIndex, timeMs }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }
  const side = (body.side === "away" ? "away" : "home") as BattleSide;
  const selectedIndex =
    typeof body.selectedIndex === "number" ? Math.round(body.selectedIndex) : 0;
  const timeMs =
    typeof body.timeMs === "number" && body.timeMs > 0 ? Math.round(body.timeMs) : 99999;

  const battle = submitAnswer(id, side, selectedIndex, timeMs);
  if (!battle) {
    return Response.json({ error: "Battle not found." }, { status: 404 });
  }
  return Response.json({ ok: true, view: viewFor(battle, side) });
}
