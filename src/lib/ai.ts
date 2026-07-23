import { EVENT_INFO } from "@/lib/events-data";
import { buildFocusDirective } from "@/lib/rules-focus";

/**
 * AI quiz generation via an OpenAI-compatible endpoint.
 *
 * The site owner sets ONE server-side secret (in .env or platform secrets)
 * and every visitor uses it automatically — no per-user setup required.
 *
 *   GROQ_API_KEY      – owner's Groq key (recommended, free). Primary source.
 *   GROQ_MODEL        – optional, defaults to a good Groq model below.
 *   AI_BASE_URL       – optional override of the endpoint.
 *
 * For backward-compat we also accept OLLAMA_API_KEY / OPENAI_API_KEY.
 *
 * The browser "settings panel" remains as an OPTIONAL override; if it is not
 * used, the server key is used for everyone.
 */

const DEFAULT_BASE_URL = "https://api.groq.com/openai";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/** Optional credentials passed from the browser (in-browser settings panel). */
export interface AiOverrides {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

/**
 * The owner's server-side key (primary source for all visitors).
 * Set GROQ_API_KEY as an environment variable in your deployment dashboard
 * (e.g. Vercel → Settings → Environment Variables) or in a local .env.local.
 */
function serverApiKey(): string {
  return (
    process.env.GROQ_API_KEY ||
    process.env.OLLAMA_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  );
}

export function aiConfig(overrides?: AiOverrides) {
  return {
    baseUrl: (overrides?.baseUrl?.trim() ||
      process.env.AI_BASE_URL ||
      process.env.OLLAMA_BASE_URL ||
      DEFAULT_BASE_URL).replace(/\/+$/, ""),
    apiKey: overrides?.apiKey?.trim() || serverApiKey(),
    model:
      overrides?.model?.trim() ||
      process.env.GROQ_MODEL ||
      process.env.OLLAMA_MODEL ||
      DEFAULT_MODEL,
  };
}

/** True if any credential source (browser override or server key) is present. */
export function isAiConfigured(overrides?: AiOverrides): boolean {
  return Boolean(overrides?.apiKey?.trim() || serverApiKey());
}

export interface GeneratedQuestion {
  eventName: string;
  division: string;
  difficulty: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Quick reachability probe (short timeout). Returns null if reachable,
 * or an error message. Used by the status endpoint so the UI can tell the
 * user their model is reachable before they generate a whole quiz.
 */
export async function probeModel(
  overrides?: AiOverrides,
): Promise<{
  ok: boolean;
  detail: string;
}> {
  const { baseUrl, apiKey } = aiConfig(overrides);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, detail: `Endpoint returned HTTP ${res.status}` };
    }
    return { ok: true, detail: "Reachable" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, detail: msg };
  } finally {
    clearTimeout(timer);
  }
}

const DIFFICULTY_GUIDE: Record<string, string> = {
  easy: "straightforward recall of definitions and basic facts",
  medium:
    "application of concepts and interpretation of data or simple calculations",
  hard: "multi-step reasoning, analysis, and nuanced edge cases",
  any: "a balanced mix of recall, application, and analysis",
};

function buildSystemPrompt(opts: {
  eventName: string;
  division: string;
  difficulty: string;
  count: number;
  season?: string;
  topic?: string;
}): string {
  const info = EVENT_INFO[opts.eventName];
  const season = opts.season || "2026";
  // Season-accurate rules focus — ensures questions match the official rules
  // for rotation events (Anatomy, Dynamic Planet, Astronomy, etc.).
  const { directive: focusDirective } = buildFocusDirective(
    season,
    opts.eventName,
    opts.topic,
  );

  return `You are an expert Science Olympiad test writer who writes rigorous, fair multiple-choice questions in the style of official invitational exams and the ${season} season rules manual.

You are writing for the "${opts.eventName}" event (Division ${opts.division}).
${info ? `Event context: ${info.long}` : ""}

━━━ RULES FOCUS (follow this precisely) ━━━
${focusDirective}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Difficulty target: ${DIFFICULTY_GUIDE[opts.difficulty] ?? DIFFICULTY_GUIDE.any}.

Rules for every question:
- Exactly 4 answer options (A–D), all plausible and unambiguous.
- One clearly correct answer; the other three are plausible distractors.
- The correct answer must be factually correct. Do not invent false "facts".
- Every question MUST stay within the rules focus above for the ${season} season. Do not ask about topics outside the season's focus.
- Include a concise explanation (1–3 sentences) stating WHY the correct option is right (and briefly why key distractors are wrong where useful).
- Avoid "all of the above" / "none of the above".
- Questions should be self-contained (assume no images).
- Vary the topics across questions; do not repeat the same question twice.

Return ONLY valid JSON (no markdown, no commentary) in exactly this shape:
{"questions":[{"topic":"short topic","prompt":"the question","options":["A text","B text","C text","D text"],"correctIndex":0,"explanation":"why"}]}
correctIndex is the 0-based index of the correct option (0–3).

Produce exactly ${opts.count} questions.`;
}

/** Extract the first {...} JSON object from a possibly-noisy model response. */
function extractJson(text: string): unknown {
  let trimmed = text.trim();
  // Strip ```json ... ``` or ``` ... ``` code fences if present.
  trimmed = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(slice);
    } catch {
      /* fall through */
    }
  }
  throw new Error("Model did not return valid JSON");
}

function asInt(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string" && /^\d+$/.test(v.trim())) return Number(v.trim());
  return fallback;
}

function normalize(
  raw: unknown,
  ctx: { eventName: string; division: string; difficulty: string },
): GeneratedQuestion | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const prompt = typeof o.prompt === "string" ? o.prompt.trim() : "";
  const explanation =
    typeof o.explanation === "string" ? o.explanation.trim() : "";
  const rawOptions = o.options;
  if (!Array.isArray(rawOptions)) return null;
  let options: string[] = rawOptions
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
  if (prompt.length < 5 || explanation.length < 5) return null;
  if (options.length < 2) return null;

  // If more than 4 options provided, keep the first 4 only when the correct
  // index still fits; otherwise reject.
  let correctIndex = asInt(o.correctIndex, -1);
  if (correctIndex < 0 || correctIndex >= options.length) return null;
  if (options.length > 4) {
    if (correctIndex >= 4) return null;
    options = options.slice(0, 4);
  }

  const topic =
    typeof o.topic === "string" && o.topic.trim()
      ? o.topic.trim()
      : "General";

  return {
    eventName: ctx.eventName,
    division: ctx.division,
    difficulty: ctx.difficulty,
    topic,
    prompt,
    options: options as string[],
    correctIndex,
    explanation,
  };
}

export async function generateQuestions(
  opts: {
    eventName: string;
    division: string;
    difficulty: string;
    count: number;
    season?: string;
    topic?: string;
  },
  overrides?: AiOverrides,
): Promise<{ questions: GeneratedQuestion[]; model: string }> {
  const { baseUrl, apiKey, model } = aiConfig(overrides);
  const count = Math.max(1, Math.min(15, opts.count));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  let content = "";
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt({
              ...opts,
              count,
              season: opts.season || "2026",
            }),
          },
          {
            role: "user",
            content: `Generate ${count} Division ${opts.division} "${
              opts.eventName
            }" questions for the ${opts.season || "2026"} season rules${
              opts.topic ? ` about: ${opts.topic}` : ""
            }. Return only the JSON object.`,
          },
        ],
        temperature: 0.7,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Model request failed (HTTP ${res.status}). ${text.slice(0, 200)}`,
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    content = data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Model request timed out (the server took too long).");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const parsed = extractJson(content) as { questions?: unknown[] };
  const list = Array.isArray(parsed.questions) ? parsed.questions : [];
  const normalized = list
    .map((item) =>
      normalize(item, {
        eventName: opts.eventName,
        division: opts.division,
        difficulty: opts.difficulty,
      }),
    )
    .filter((q): q is GeneratedQuestion => q !== null)
    .slice(0, count);

  if (normalized.length === 0) {
    throw new Error(
      "The model responded, but no valid questions could be parsed. Try again.",
    );
  }

  return { questions: normalized, model };
}

/**
 * AI arbiter: review a player's objection to a question. Returns whether the
 * objection is valid (the question/answer is flawed) and a short verdict.
 */
export async function reviewQuestion(
  opts: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    reason: string;
  },
  overrides?: AiOverrides,
): Promise<{ upheld: boolean; verdict: string; model: string }> {
  const { baseUrl, apiKey, model } = aiConfig(overrides);
  const letters = ["A", "B", "C", "D"];
  const optionsText = opts.options
    .map((o, i) => `${letters[i] ?? i + 1}) ${o}`)
    .join("\n");
  const marked = `${letters[opts.correctIndex] ?? opts.correctIndex + 1}) ${opts.options[opts.correctIndex] ?? ""}`;

  const system = `You are a strict, fair Science Olympiad rules arbiter. A competitor has flagged a multiple-choice practice question as incorrect or illogical. Decide whether their objection is VALID.

Rules:
- Uphold (upheld=true) ONLY if the marked answer is factually wrong, OR the question is genuinely ambiguous/illogical such that no single answer is clearly correct, OR a different option is equally or more defensible.
- Do NOT uphold merely because the competitor is unsure, guessed wrong, or dislikes the question — require a legitimate factual or logical flaw.
- Verify the underlying science objectively.

Return ONLY valid JSON, no markdown: {"upheld": true|false, "verdict": "one short sentence explaining the decision"}`;

  const user = `Question:
${opts.prompt}

Options:
${optionsText}

Marked correct answer: ${marked}
Official explanation: ${opts.explanation}

Competitor's objection:
${opts.reason}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let content = "";
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        stream: false,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Review request failed (HTTP ${res.status}). ${text.slice(0, 160)}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    content = data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("The review took too long. Try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const parsed = extractJson(content) as { upheld?: unknown; verdict?: unknown };
  const upheld = parsed.upheld === true || parsed.upheld === "true";
  const verdict =
    typeof parsed.verdict === "string" && parsed.verdict.trim()
      ? parsed.verdict.trim()
      : upheld
        ? "The question has been flagged as flawed."
        : "The question is correct as marked.";
  return { upheld, verdict, model };
}
