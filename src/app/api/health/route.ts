import { isDbAvailable, db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/health — reports whether the server is up. Database is optional.
export async function GET() {
  if (!isDbAvailable) {
    return Response.json({ ok: true, db: false });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: true });
  } catch {
    return Response.json({ ok: false, db: true }, { status: 500 });
  }
}
