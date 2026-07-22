import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * The database is OPTIONAL at build time (so the build never crashes without
 * DATABASE_URL), but account features REQUIRE it at runtime. If not set, auth
 * endpoints return a clear error.
 */
const databaseUrl = process.env.DATABASE_URL || "";

export const isDbAvailable = Boolean(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __sciolyPool?: Pool;
  __sciolySchemaReady?: boolean;
  __sciolyLastCleanup?: number;
};

/**
 * Hosted Postgres (Neon, Supabase, Render, etc.) requires SSL. node-postgres
 * does NOT auto-enable SSL from `sslmode=require` in the connection string, so
 * we enable it explicitly when the URL points at a known hosted provider.
 * (Local dev Postgres has SSL off, so we leave it disabled there.)
 */
const useSsl = /neon\.tech|sslmode=require|supabase\.co|\.render\.com|aiven|\.elephantsql\.com|\.fly\.dev/i.test(
  databaseUrl,
);

let pool: Pool | null = null;
if (databaseUrl) {
  pool =
    globalForDb.__sciolyPool ??
    new Pool({
      connectionString: databaseUrl,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__sciolyPool = pool;
  }
}

export { pool };

// `db` is null-ish when no database is configured; callers must check
// `isDbAvailable` before using it.
export const db = pool
  ? drizzle(pool)
  : (null as unknown as ReturnType<typeof drizzle>);

/**
 * Auto-provision tables on first use (CREATE TABLE IF NOT EXISTS), so a fresh
 * hosted database needs no migration step. Idempotent and memoized globally.
 */
export async function ensureSchema(): Promise<void> {
  if (!isDbAvailable || !pool) return;
  if (globalForDb.__sciolySchemaReady) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "emoji" TEXT NOT NULL DEFAULT '🦊',
        "rating" INTEGER NOT NULL DEFAULT 1000,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "users_username_uniq" ON "users" ("username");

      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" SERIAL PRIMARY KEY,
        "token" TEXT NOT NULL,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "expires_at" TIMESTAMP NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_uniq" ON "sessions" ("token");
      CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" ("user_id");

      CREATE TABLE IF NOT EXISTS "match_requests" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "username" TEXT NOT NULL,
        "emoji" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "event_name" TEXT NOT NULL,
        "division" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'open',
        "match_id" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "match_requests_status_idx" ON "match_requests" ("status");
      CREATE INDEX IF NOT EXISTS "match_requests_user_idx" ON "match_requests" ("user_id");

      CREATE TABLE IF NOT EXISTS "matches" (
        "id" SERIAL PRIMARY KEY,
        "event_name" TEXT NOT NULL,
        "division" TEXT NOT NULL,
        "season" TEXT NOT NULL,
        "questions" JSONB NOT NULL,
        "player_a_id" INTEGER NOT NULL,
        "player_a_name" TEXT NOT NULL,
        "player_a_emoji" TEXT NOT NULL,
        "player_a_rating" INTEGER NOT NULL,
        "player_b_id" INTEGER NOT NULL,
        "player_b_name" TEXT NOT NULL,
        "player_b_emoji" TEXT NOT NULL,
        "player_b_rating" INTEGER NOT NULL,
        "answers_a" JSONB,
        "answers_b" JSONB,
        "submitted_a" BOOLEAN NOT NULL DEFAULT FALSE,
        "submitted_b" BOOLEAN NOT NULL DEFAULT FALSE,
        "status" TEXT NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "matches_a_idx" ON "matches" ("player_a_id");
      CREATE INDEX IF NOT EXISTS "matches_b_idx" ON "matches" ("player_b_id");

      CREATE TABLE IF NOT EXISTS "match_challenges" (
        "id" SERIAL PRIMARY KEY,
        "from_user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "from_username" TEXT NOT NULL,
        "from_emoji" TEXT NOT NULL,
        "to_user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "to_username" TEXT NOT NULL,
        "event_name" TEXT NOT NULL,
        "division" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "match_id" INTEGER,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "match_challenges_to_idx" ON "match_challenges" ("to_user_id", "status");
      CREATE INDEX IF NOT EXISTS "match_challenges_from_idx" ON "match_challenges" ("from_user_id", "status");
    `);
    globalForDb.__sciolySchemaReady = true;
  } finally {
    client.release();
  }
}

/**
 * Opportunistic cleanup: only RATING is kept long-term. Finished/abandoned
 * matches are deleted shortly after they're done (so both players can still
 * view results), and stale matchmaking requests are pruned. Throttled to run
 * at most once per minute.
 */
const CLEANUP_INTERVAL_MS = 60_000;
const MATCH_KEEP_MS = 30 * 60_000; // keep match rows ~30 min after creation
const REQUEST_KEEP_MS = 15 * 60_000; // prune stale open requests after 15 min

export async function cleanupStaleData(): Promise<void> {
  if (!isDbAvailable || !pool) return;
  const now = Date.now();
  if (
    globalForDb.__sciolyLastCleanup &&
    now - globalForDb.__sciolyLastCleanup < CLEANUP_INTERVAL_MS
  ) {
    return;
  }
  globalForDb.__sciolyLastCleanup = now;
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM matches WHERE "created_at" < NOW() - ($1 || ' milliseconds')::interval`, [
      String(MATCH_KEEP_MS),
    ]);
    await client.query(`DELETE FROM match_requests WHERE "created_at" < NOW() - ($1 || ' milliseconds')::interval`, [
      String(REQUEST_KEEP_MS),
    ]);
    // Stale directed challenges (no accept within the window).
    await client.query(`DELETE FROM match_challenges WHERE "created_at" < NOW() - ($1 || ' milliseconds')::interval`, [
      String(REQUEST_KEEP_MS),
    ]);
  } finally {
    client.release();
  }
}
