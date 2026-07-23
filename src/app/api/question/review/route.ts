import { NextRequest } from "next/server";
import { reviewQuestion, isAiConfigured } from "@/lib/ai";
import { overridesFromHeaders } from "@/lib/ai-config";

export const dynamic = "force-dynamic";

// POST /api/question/review
// Body: { prompt, options, correctIndex, explanation, reason }
// Returns: { upheld, verdict } — whether the player's objection is valid.
export async function POST(req: NextRequest) {
  const overrides = overridesFromHeaders(req.headers);
  if (!isAiConfigured(overrides)) {
    return Response.json(
      { error: "AI review isn't configured (GROQ_API_KEY)." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const options = Array.isArray(body.options) ? body.options.filter((x): x is string => typeof x === "string") : [];
  const correctIndex = typeof body.correctIndex === "number" ? body.correctIndex : 0;
  const explanation = typeof body.explanation === "string" ? body.explanation : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!prompt || options.length < 2 || reason.length < 3) {
    return Response.json({ error: "Missing question details or reason." }, { status: 400 });
  }

  try {
    const result = await reviewQuestion({ prompt, options, correctIndex, explanation, reason }, overrides);
    return Response.json({ upheld: result.upheld, verdict: result.verdict });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
