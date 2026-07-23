import { NextRequest } from "next/server";
import { db, ensureSchema } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { reviewQuestion, isAiConfigured } from "@/lib/ai";
import { overridesFromHeaders } from "@/lib/ai-config";
import { getUserFromRequest } from "@/lib/auth";
import type { BattleQuestion } from "@/lib/battle-client";

export const dynamic = "force-dynamic";

// POST /api/question/review
//  - Bot-arena mode: { prompt, options, correctIndex, explanation, reason }
//  - Human-match mode: { matchId, questionIndex, reason }
//      The server looks up the real question/answer from the match (so the
//      client never needs the correct answer during fair play) and returns a
//      NEUTRAL verdict that doesn't reveal the answer.
// Returns: { upheld, verdict }.
export async function POST(req: NextRequest) {
  const overrides = overridesFromHeaders(req.headers);
  if (!isAiConfigured(overrides)) {
    return Response.json({ error: "AI review isn't configured (GROQ_API_KEY)." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 3) {
    return Response.json({ error: "Please explain your reason." }, { status: 400 });
  }

  // ── Human-match mode: resolve the question server-side ──
  if (body.matchId != null && body.questionIndex != null) {
    const user = await getUserFromRequest(req);
    if (!user) return Response.json({ error: "You must be logged in." }, { status: 401 });
    const matchId = Number(body.matchId);
    const questionIndex = Number(body.questionIndex);
    if (!Number.isFinite(matchId)) return Response.json({ error: "Invalid match." }, { status: 400 });
    await ensureSchema();
    const [m] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    if (!m) return Response.json({ error: "Match not found." }, { status: 404 });
    if (m.playerAId !== user.id && m.playerBId !== user.id) {
      return Response.json({ error: "You're not in this match." }, { status: 403 });
    }
    const questions = m.questions as unknown as BattleQuestion[];
    const q = questions[questionIndex];
    if (!q) return Response.json({ error: "Invalid question." }, { status: 400 });

    try {
      const result = await reviewQuestion(
        { prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, reason },
        overrides,
      );
      // Neutral verdict — must NOT reveal the correct answer during fair play.
      const verdict = result.upheld
        ? "Report upheld — this question will be disregarded in scoring."
        : "Report not upheld — the question is valid as written.";
      return Response.json({ upheld: result.upheld, verdict });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Review failed.";
      return Response.json({ error: message }, { status: 502 });
    }
  }

  // ── Bot-arena mode: question fields provided by the client ──
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const options = Array.isArray(body.options) ? body.options.filter((x): x is string => typeof x === "string") : [];
  const correctIndex = typeof body.correctIndex === "number" ? body.correctIndex : 0;
  const explanation = typeof body.explanation === "string" ? body.explanation : "";
  if (!prompt || options.length < 2) {
    return Response.json({ error: "Missing question details." }, { status: 400 });
  }
  try {
    const result = await reviewQuestion({ prompt, options, correctIndex, explanation, reason }, overrides);
    return Response.json({ upheld: result.upheld, verdict: result.verdict });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
