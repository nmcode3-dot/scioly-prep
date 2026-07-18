import { SEASON_SLATES, EVENT_INFO } from "@/lib/events-data";

export const dynamic = "force-dynamic";

// GET /api/battle-events — distinct (name, division) combos available for battles.
export async function GET() {
  const seen = new Set<string>();
  const events: { name: string; division: "B" | "C" }[] = [];
  // Battles use the current season only.
  for (const slate of SEASON_SLATES) {
    if (slate.season !== "2026") continue;
    for (const name of slate.events) {
      if (!EVENT_INFO[name]) continue;
      const key = `${name}|${slate.division}`;
      if (seen.has(key)) continue;
      seen.add(key);
      events.push({ name, division: slate.division as "B" | "C" });
    }
  }
  events.sort((a, b) => a.name.localeCompare(b.name));
  return Response.json({ events });
}
