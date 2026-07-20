import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Accounts. A user signs up with just a username + password (no email).
 * Their username is shown as their battle name; rating is stored per-user.
 */
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
  (t) => ({
    usernameUniq: uniqueIndex("users_username_uniq").on(t.username),
  }),
);

/**
 * Opaque session tokens (stored in an httpOnly cookie). DB-backed so they
 * work across serverless instances without a shared JWT secret.
 */
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => ({
    tokenUniq: uniqueIndex("sessions_token_uniq").on(t.token),
    byUser: index("sessions_user_idx").on(t.userId),
  }),
);

/**
 * A single 1v1 battle. Stored so judging is server-authoritative (the client
 * can't fabricate a win or fake the opponent's rating).
 */
export const battles = pgTable(
  "battles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventName: text("event_name").notNull(),
    division: text("division").notNull(),
    season: text("season").notNull(),
    oppName: text("opp_name").notNull(),
    oppEmoji: text("opp_emoji").notNull(),
    oppRating: integer("opp_rating").notNull(),
    questions: jsonb("questions").notNull(),
    botAnswers: jsonb("bot_answers").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byUser: index("battles_user_idx").on(t.userId),
  }),
);

export type UserRow = typeof users.$inferSelect;
