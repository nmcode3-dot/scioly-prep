import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * The event catalog. One row per (event name, season, division).
 * Seasons: "2025" (previous), "2026" (current 2025-26 series),
 * "2027" (projected next-year series).
 */
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    division: text("division").notNull(), // "B" | "C"
    season: text("season").notNull(), // "2025" | "2026" | "2027"
    category: text("category").notNull(),
    type: text("type").notNull(), // "Study" | "Lab" | "Build"
    shortDescription: text("short_description").notNull(),
    longDescription: text("long_description"),
    icon: text("icon").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    slugUniq: uniqueIndex("events_slug_season_division_uniq").on(
      t.slug,
      t.season,
      t.division,
    ),
    byName: index("events_name_idx").on(t.name),
  }),
);

/**
 * The practice question bank. Questions are keyed by `eventName` + `division`
 * (rather than a specific catalog row) so a single bank serves every season.
 * division may be "B", "C", or "BC" (applies to both divisions).
 */
export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    eventName: text("event_name").notNull(),
    division: text("division").notNull(), // "B" | "C" | "BC"
    difficulty: text("difficulty").notNull(), // "easy" | "medium" | "hard"
    topic: text("topic").notNull(),
    prompt: text("prompt").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    explanation: text("explanation").notNull(),
    source: text("source"),
    /** true for AI-generated questions; false for the curated bank. */
    generated: boolean("generated").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byEventName: index("questions_event_name_idx").on(t.eventName, t.division),
    byGenerated: index("questions_generated_idx").on(t.generated),
  }),
);

/**
 * Persisted quiz attempts so users can review history and retake tests.
 */
export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    eventName: text("event_name").notNull(),
    season: text("season"),
    division: text("division"),
    difficulty: text("difficulty").notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    responses: jsonb("responses").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byCreated: index("quiz_attempts_created_idx").on(t.createdAt),
  }),
);

export type EventRow = typeof events.$inferSelect;
export type QuestionRow = typeof questions.$inferSelect;
export type QuizAttemptRow = typeof quizAttempts.$inferSelect;
