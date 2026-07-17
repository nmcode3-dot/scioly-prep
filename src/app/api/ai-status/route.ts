import { NextRequest } from "next/server";
import { aiConfig, isAiConfigured, probeModel } from "@/lib/ai";
import { overridesFromHeaders } from "@/lib/ai-config";

export const dynamic = "force-dynamic";

// GET /api/ai-status — tells the UI whether AI generation is available.
// Config may come from env vars OR from headers (in-browser settings panel).
export async function GET(req: NextRequest) {
  const overrides = overridesFromHeaders(req.headers);
  const cfg = aiConfig(overrides);
  const configured = isAiConfigured(overrides);

  if (!configured) {
    return Response.json({
      configured: false,
      model: cfg.model,
      source: overrides ? "browser" : "env",
      message:
        "AI is not configured. Open the AI settings to paste your Groq API key.",
    });
  }

  const probe = await probeModel(overrides);
  return Response.json({
    configured: true,
    reachable: probe.ok,
    model: cfg.model,
    source: overrides ? "browser" : "env",
    message: probe.ok
      ? `Connected · model "${cfg.model}"`
      : `Configured but not reachable: ${probe.detail}`,
  });
}
