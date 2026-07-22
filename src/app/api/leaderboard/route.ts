import { NextRequest } from "next/server";
import { db, ensureSchema, isDbAvailable } from "@/db";
import { users } from "@/db/schema";
import { desc, asc, gt, count } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/leaderboard  → { top: [...100], me: { rank, rating, username, emoji, inTop100 } | null }
export async function GET(req: NextRequest) {
  if (!isDbAvailable) {
    return Response.json({ error: "Leaderboard requires a database (DATABASE_URL)." }, { status: 503 });
  }
  await ensureSchema();

  // Top 100 by rating (ties broken alphabetically for stable ordering).
  const top = await db
    .select({
      username: users.username,
      emoji: users.emoji,
      rating: users.rating,
    })
    .from(users)
    .orderBy(desc(users.rating), asc(users.username))
    .limit(100);

  const user = await getUserFromRequest(req);
  let me: { rank: number; rating: number; username: string; emoji: string; inTop100: boolean } | null = null;
  if (user) {
    const [row] = await db
      .select({ value: count() })
      .from(users)
      .where(gt(users.rating, user.rating));
    const rank = (row?.value ?? 0) + 1;
    me = {
      rank,
      rating: user.rating,
      username: user.username,
      emoji: user.emoji,
      inTop100: rank <= 100,
    };
  }

  return Response.json({
    top: top.map((t, i) => ({ rank: i + 1, ...t })),
    me,
    total: await db
      .select({ value: count() })
      .from(users)
      .then((r) => r[0]?.value ?? 0),
  });
}


