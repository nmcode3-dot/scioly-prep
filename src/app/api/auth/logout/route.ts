import { NextRequest } from "next/server";
import {
  readCookie,
  deleteSession,
  clearCookieHeader,
  SESSION_COOKIE,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/logout
export async function POST(req: NextRequest) {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) await deleteSession(token);
  return Response.json(
    { ok: true },
    { headers: { "set-cookie": clearCookieHeader() } },
  );
}
