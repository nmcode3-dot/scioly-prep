import type { AiOverrides } from "@/lib/ai";

/**
 * Client-side AI configuration. Lets the user paste their Groq (or other
 * OpenAI-compatible) API key in the browser, stored locally on their device.
 * The config is passed to the server on each request via headers, so the
 * actual LLM call + prompt logic stay server-side.
 */

export interface AiClientConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ProviderPreset {
  id: string;
  label: string;
  baseUrl: string;
  model: string;
  hint: string;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "groq",
    label: "Groq (free, recommended)",
    baseUrl: "https://api.groq.com/openai",
    model: "llama-3.3-70b-versatile",
    hint: "Free, no credit card. Get a key at console.groq.com/keys",
  },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    hint: "Requires a paid OpenAI key from platform.openai.com",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.3-70b-instruct",
    hint: "Many models, some free. Key at openrouter.ai/keys",
  },
  {
    id: "ollama",
    label: "Ollama (local — needs a public tunnel)",
    baseUrl: "http://localhost:11434",
    model: "llama3.1",
    hint: "Only works if your local Ollama is exposed via a public URL (ngrok/cloudflare)",
  },
  {
    id: "custom",
    label: "Custom OpenAI-compatible",
    baseUrl: "",
    model: "",
    hint: "Any endpoint that speaks /v1/chat/completions",
  },
];

const STORAGE_KEY = "scioly.ai-config.v1";

export const DEFAULT_CONFIG: AiClientConfig = {
  baseUrl: "https://api.groq.com/openai",
  apiKey: "",
  model: "llama-3.3-70b-versatile",
};

export function getStoredConfig(): AiClientConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AiClientConfig>;
    return {
      baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl : DEFAULT_CONFIG.baseUrl,
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      model: typeof parsed.model === "string" ? parsed.model : DEFAULT_CONFIG.model,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setStoredConfig(cfg: AiClientConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function clearStoredConfig(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isConfigured(cfg: AiClientConfig | null): boolean {
  return Boolean(cfg && cfg.apiKey.trim());
}

/** Build the headers that carry the user's config to our server routes. */
export function aiHeaders(cfg: AiClientConfig | null): Record<string, string> {
  if (!cfg || !cfg.apiKey.trim()) return {};
  return {
    "x-ai-base": cfg.baseUrl,
    "x-ai-key": cfg.apiKey,
    "x-ai-model": cfg.model,
  };
}

/** Parse the config back out of headers on the server. */
export function overridesFromHeaders(
  headers: Headers,
): AiOverrides | undefined {
  const baseUrl = headers.get("x-ai-base") ?? undefined;
  const apiKey = headers.get("x-ai-key") ?? undefined;
  const model = headers.get("x-ai-model") ?? undefined;
  if (!apiKey && !baseUrl && !model) return undefined;
  return { baseUrl, apiKey, model };
}
