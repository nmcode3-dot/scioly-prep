import bcrypt from "bcryptjs";
import { db, ensureSchema, isDbAvailable } from "@/db";
import { users, sessions, type UserRow } from "@/db/schema";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "scioly_session";
const SESSION_TTL_DAYS = 30;
const BCRYPT_ROUNDS = 10;

export interface PublicUser {
  id: number;
  username: string;
  emoji: string;
  rating: number;
}

export function toPublicUser(u: UserRow): PublicUser {
  return { id: u.id, username: u.username, emoji: u.emoji, rating: u.rating };
}

export function dbUnavailable() {
  return !isDbAvailable || !db;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function validateUsername(username: string): string | null {
  const u = username.trim();
  if (u.length < 3 || u.length > 20) return "Username must be 3–20 characters.";
  if (!/^[a-zA-Z0-9_\- ]+$/.test(u)) return "Use only letters, numbers, spaces, underscores, or hyphens.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 100) return "Password is too long.";
  return null;
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(userId: number): Promise<string> {
  await ensureSchema();
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  if (dbUnavailable()) return;
  await ensureSchema();
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function getUserFromRequest(req: Request): Promise<PublicUser | null> {
  if (dbUnavailable()) return null;
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  return getUserByToken(token);
}

export async function getUserByToken(token: string): Promise<PublicUser | null> {
  if (dbUnavailable()) return null;
  await ensureSchema();
  const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return user ? toPublicUser(user) : null;
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookieHeader(token: string): string {
  const maxAge = SESSION_TTL_DAYS * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
