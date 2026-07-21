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

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    emoji: text("emoji").notNull().default("🦊"),
    rating: integer("rating").notNull().default(1000),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({ usernameUniq: uniqueIndex("users_username_uniq").on(t.username) }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => ({
    tokenUniq: uniqueIndex("sessions_token_uniq").on(t.token),
    byUser: index("sessions_user_idx").on(t.userId),
  }),
);

/** Open matchmaking requests — the live "looking for a match" board. */
export const matchRequests = pgTable(
  "match_requests",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    emoji: text("emoji").notNull(),
    rating: integer("rating").notNull(),
    eventName: text("event_name").notNull(),
    division: text("division").notNull(),
    status: text("status").notNull().default("open"), // open | matched | cancelled
    matchId: integer("match_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byStatus: index("match_requests_status_idx").on(t.status),
    byUser: index("match_requests_user_idx").on(t.userId),
  }),
);

/** A live human-vs-human match. Server-authoritative judging + rating. */
export const matches = pgTable(
  "matches",
  {
    id: serial("id").primaryKey(),
    eventName: text("event_name").notNull(),
    division: text("division").notNull(),
    season: text("season").notNull(),
    questions: jsonb("questions").notNull(),
    playerAId: integer("player_a_id").notNull(),
    playerAName: text("player_a_name").notNull(),
    playerAEmoji: text("player_a_emoji").notNull(),
    playerARating: integer("player_a_rating").notNull(),
    playerBId: integer("player_b_id").notNull(),
    playerBName: text("player_b_name").notNull(),
    playerBEmoji: text("player_b_emoji").notNull(),
    playerBRating: integer("player_b_rating").notNull(),
    answersA: jsonb("answers_a"),
    answersB: jsonb("answers_b"),
    submittedA: boolean("submitted_a").notNull().default(false),
    submittedB: boolean("submitted_b").notNull().default(false),
    status: text("status").notNull().default("active"), // active | finished
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({ byA: index("matches_a_idx").on(t.playerAId), byB: index("matches_b_idx").on(t.playerBId) }),
);

export type UserRow = typeof users.$inferSelect;
