import { SEASON_SLATES, EVENT_INFO, slugify } from "@/lib/events-data";
import { QUESTION_BANK } from "@/lib/questions-data";
import { matchesDivision } from "@/lib/bank";
import type { CatalogEvent, Division } from "@/lib/types";

/**
 * Source-backed data access — NO database required.
 * The event catalog and question bank are built directly from the source files
 * in src/lib/*-data.ts. This keeps the app fully functional with only a Groq
 * key configured (no DATABASE_URL needed).
 */

const CATALOG: CatalogEvent[] = (() => {
  const rows: CatalogEvent[] = [];
  let id = 0;
  for (const slate of SEASON_SLATES) {
    for (const name of slate.events) {
      const info = EVENT_INFO[name];
      if (!info) continue;
      id++;
      rows.push({
        id,
        name: info.name,
        slug: slugify(info.name),
        division: slate.division as Division,
        season: slate.season as CatalogEvent["season"],
        category: info.category,
        type: info.type as CatalogEvent["type"],
        short: info.short,
        long: info.long,
        icon: info.icon,
        questionCount: QUESTION_BANK.filter(
          (q) =>
            q.eventName === name &&
            matchesDivision(q.division, slate.division),
        ).length,
      });
    }
  }
  return rows;
})();

export async function getCatalogEvents(
  filters: {
    division?: string;
    season?: string;
    category?: string;
    type?: string;
    search?: string;
  } = {},
): Promise<CatalogEvent[]> {
  let rows = CATALOG;
  if (filters.division === "B" || filters.division === "C") {
    rows = rows.filter((r) => r.division === filters.division);
  }
  if (filters.season) {
    rows = rows.filter((r) => r.season === filters.season);
  }
  if (filters.category) {
    rows = rows.filter((r) => r.category === filters.category);
  }
  if (filters.type) {
    rows = rows.filter((r) => r.type === filters.type);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter((r) => r.name.toLowerCase().includes(s));
  }
  return [...rows].sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );
}

export async function getEventById(id: number): Promise<CatalogEvent | null> {
  return CATALOG.find((r) => r.id === id) ?? null;
}

export async function getQuizPickOptions(): Promise<
  { eventName: string; division: Division; count: number }[]
> {
  const map = new Map<string, number>();
  for (const q of QUESTION_BANK) {
    const divs = q.division === "BC" ? ["B", "C"] : [q.division];
    for (const d of divs) {
      const k = `${q.eventName}|${d}`;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([k, count]) => {
      const [name, div] = k.split("|");
      return { eventName: name, division: div as Division, count };
    })
    .sort((a, b) => a.eventName.localeCompare(b.eventName));
}

export async function getStats(): Promise<{
  eventCount: number;
  questionCount: number;
  attemptCount: number;
}> {
  return {
    eventCount: CATALOG.length,
    questionCount: QUESTION_BANK.length,
    attemptCount: 0,
  };
}
