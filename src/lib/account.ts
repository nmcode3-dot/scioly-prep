/**
 * Client-side (device-local) accounts.
 *
 * Accounts, passwords, and rating are stored in the browser's localStorage —
 * so NO database is required to deploy. Trade-off: an account lives only on
 * this device/browser, is lost if site data is cleared, and the password is a
 * local gate only (not real server-side security). That's the right trade for a
 * single-device battle game with no cross-device sync.
 */

const ACCOUNTS_KEY = "scioly.accounts.v1"; // username(lower) -> Account
const CURRENT_KEY = "scioly.current.v1"; // currently logged-in username(lower)
const APP_SALT = "scioly-battle-v1";
export const DEFAULT_RATING = 1000;

export interface Account {
  username: string; // original casing for display
  passwordHash: string;
  emoji: string;
  rating: number;
}

interface AccountMap {
  [usernameLower: string]: Account;
}

export interface PublicAccount {
  username: string;
  emoji: string;
  rating: number;
}

function toPublic(a: Account): PublicAccount {
  return { username: a.username, emoji: a.emoji, rating: a.rating };
}

function readAccounts(): AccountMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as AccountMap) : {};
  } catch {
    return {};
  }
}

function writeAccounts(map: AccountMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${APP_SALT}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function validateUsername(username: string): string | null {
  const u = username.trim();
  if (u.length < 3 || u.length > 20) return "Username must be 3–20 characters.";
  if (!/^[a-zA-Z0-9_\- ]+$/.test(u))
    return "Use only letters, numbers, spaces, underscores, or hyphens.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export function getCurrent(): PublicAccount | null {
  if (typeof window === "undefined") return null;
  const key = window.localStorage.getItem(CURRENT_KEY);
  if (!key) return null;
  const a = readAccounts()[key];
  return a ? toPublic(a) : null;
}

export async function signup(
  username: string,
  password: string,
  emoji: string,
): Promise<{ ok: true; account: PublicAccount } | { ok: false; error: string }> {
  const err = validateUsername(username);
  if (err) return { ok: false, error: err };
  const perr = validatePassword(password);
  if (perr) return { ok: false, error: perr };

  const key = username.trim().toLowerCase();
  const map = readAccounts();
  if (map[key]) return { ok: false, error: "That username is taken." };

  const account: Account = {
    username: username.trim(),
    passwordHash: await hashPassword(password),
    emoji: emoji || "🦊",
    rating: DEFAULT_RATING,
  };
  map[key] = account;
  writeAccounts(map);
  window.localStorage.setItem(CURRENT_KEY, key);
  window.dispatchEvent(new Event("scioly-account-change"));
  return { ok: true, account: toPublic(account) };
}

export async function login(
  username: string,
  password: string,
): Promise<{ ok: true; account: PublicAccount } | { ok: false; error: string }> {
  const key = username.trim().toLowerCase();
  const map = readAccounts();
  const a = map[key];
  if (!a) return { ok: false, error: "Incorrect username or password." };
  if ((await hashPassword(password)) !== a.passwordHash)
    return { ok: false, error: "Incorrect username or password." };
  window.localStorage.setItem(CURRENT_KEY, key);
  window.dispatchEvent(new Event("scioly-account-change"));
  return { ok: true, account: toPublic(a) };
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CURRENT_KEY);
  window.dispatchEvent(new Event("scioly-account-change"));
}

/** Update the current account's rating in place. */
export function updateRating(newRating: number): void {
  if (typeof window === "undefined") return;
  const key = window.localStorage.getItem(CURRENT_KEY);
  if (!key) return;
  const map = readAccounts();
  if (!map[key]) return;
  map[key].rating = Math.max(100, Math.round(newRating));
  writeAccounts(map);
  window.dispatchEvent(new Event("scioly-account-change"));
}
