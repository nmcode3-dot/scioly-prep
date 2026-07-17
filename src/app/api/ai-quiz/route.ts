import { NextRequest } from "next/server";
import { generateQuestions, isAiConfigured } from "@/lib/ai";
import { overridesFromHeaders } from "@/lib/ai-config";

export const dynamic = "force-dynamic";

// POST /api/ai-quiz
// Body: { eventName, division, difficulty, count, topic? }
// Generates fresh questions via Groq and returns them directly (no database
// needed). Grading happens client-side after the user submits.
export async function POST(req: NextRequest) {
  const overrides = overridesFromHeaders(req.headers);

  if (!isAiConfigured(overrides)) {
    return Response.json(
      {
        error:
          "AI generation is not configured. The site owner must add a GROQ_API_KEY.",
      },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const eventName =
    typeof body.eventName === "string" ? body.eventName.trim() : "";
  const division = body.division === "C" ? "C" : "B";
  const difficultyRaw =
    typeof body.difficulty === "string" ? body.difficulty : "any";
  const difficulty =
    difficultyRaw === "easy" ||
    difficultyRaw === "medium" ||
    difficultyRaw === "hard"
      ? difficultyRaw
      : "any";
  const countRaw = Number(body.count ?? 5);
  const count = Number.isFinite(countRaw)
    ? Math.max(1, Math.min(15, Math.round(countRaw)))
    : 5;
  const topic = typeof body.topic === "string" ? body.topic.trim() : undefined;

  if (!eventName) {
    return Response.json({ error: "eventName is required." }, { status: 400 });
  }

  try {
    const { questions, model } = await generateQuestions(
      { eventName, division, difficulty, count, topic },
      overrides,
    );
    return Response.json({
      questions,
      model,
      ai: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
