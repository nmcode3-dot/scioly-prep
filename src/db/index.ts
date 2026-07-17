import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * The database is OPTIONAL. If DATABASE_URL is not set, the app runs in a
 * fully functional database-free mode (events + question bank come from source
 * code, AI quizzes from Groq, history in the browser). This lets you deploy
 * with only a Groq key and no database setup.
 */
const databaseUrl = process.env.DATABASE_URL || "";

export const isDbAvailable = Boolean(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __sciolyPool?: Pool;
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
