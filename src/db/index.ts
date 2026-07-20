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
};

let pool: Pool | null = null;
if (databaseUrl) {
  pool = globalForDb.__sciolyPool ?? new Pool({ connectionString: databaseUrl });
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

      CREATE TABLE IF NOT EXISTS "battles" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "event_name" TEXT NOT NULL,
        "division" TEXT NOT NULL,
        "season" TEXT NOT NULL,
        "opp_name" TEXT NOT NULL,
        "opp_emoji" TEXT NOT NULL,
        "opp_rating" INTEGER NOT NULL,
        "questions" JSONB NOT NULL,
        "bot_answers" JSONB NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "battles_user_idx" ON "battles" ("user_id");
    `);
    globalForDb.__sciolySchemaReady = true;
  } finally {
    client.release();
  }
}
