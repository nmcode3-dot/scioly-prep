"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT_INFO } from "@/lib/events-data";
import { divisionShort } from "@/lib/ui";
import {
  aiHeaders,
  getStoredConfig,
  type AiClientConfig,
} from "@/lib/ai-config";
import { AiSettingsDialog } from "@/components/ai-settings-dialog";

interface BuilderOption {
  eventName: string;
  division: "B" | "C";
  count: number;
  icon: string;
  category: string;
}

type Status =
  | { state: "loading" }
  | { state: "off" }
  | { state: "on"; model: string; reachable: boolean; message: string };

const keyOf = (o: BuilderOption) => `${o.eventName}|${o.division}`;

const DIFFICULTIES = [
  { value: "any", label: "Mixed" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function AiQuizGenerator({
  options,
  defaultKey,
}: {
  options: BuilderOption[];
  defaultKey?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const [config, setConfig] = useState<AiClientConfig>(() => getStoredConfig());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(
    defaultKey && options.some((o) => keyOf(o) === defaultKey)
      ? defaultKey
      : null,
  );
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback((cfg: AiClientConfig) => {
    setStatus({ state: "loading" });
    let cancelled = false;
    fetch("/api/ai-status", { headers: aiHeaders(cfg) })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.configured) {
          setStatus({ state: "off" });
        } else {
          setStatus({
            state: "on",
            model: data.model ?? "?",
            reachable: Boolean(data.reachable),
            message: data.message ?? "",
          });
        }
      })
      .catch(() => !cancelled && setStatus({ state: "off" }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const stop = checkStatus(config);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaved = (cfg: AiClientConfig) => {
    setConfig(cfg);
    checkStatus(cfg);
  };

  const selectedOption = options.find((o) => keyOf(o) === selected) ?? null;
  // Ready when a working connection exists — either the owner's server key
  // (status "on") or a valid per-browser override.
  const ready = status.state === "on" && status.reachable;

  const filtered = options.filter((o) =>
    o.eventName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const selectClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  const generate = async () => {
    if (!selectedOption) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiHeaders(config) },
        body: JSON.stringify({
          eventName: selectedOption.eventName,
          division: selectedOption.division,
          difficulty,
          count,
          topic: topic || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        setBusy(false);
        return;
      }
      const params = new URLSearchParams({
        ids: (data.ids as number[]).join(","),
        event: selectedOption.eventName,
        division: selectedOption.division,
        difficulty,
        ai: "1",
      });
      router.push(`/quiz?${params.toString()}`);
    } catch {
      setError("Network error contacting the AI service.");
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
      <AiSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={handleSaved}
      />
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg">
          ✨
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-slate-900">
            AI Question Generator
          </h3>
          <p className="text-xs text-slate-500">
            Generate unlimited fresh questions on demand — powered by Groq.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          ⚙ Settings
        </button>
      </div>

      {/* Status banner */}
      <div className="mt-4">
        {status.state === "loading" && (
          <Banner tone="muted">Checking AI status…</Banner>
        )}
        {status.state === "off" && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            <span>
              AI isn&apos;t enabled on the server yet. Owners can add a{" "}
              <code className="rounded bg-white/70 px-1 py-0.5 text-[11px]">
                GROQ_API_KEY
              </code>{" "}
              to turn it on for everyone.
            </span>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="shrink-0 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700"
            >
              Use my own key
            </button>
          </div>
        )}
        {status.state === "on" && (
          <div className="flex items-center justify-between gap-2">
            <Banner tone={status.reachable ? "ok" : "warn"}>
              {status.reachable ? `✓ ${status.message}` : `⚠ ${status.message}`}
            </Banner>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="shrink-0 text-[11px] font-semibold text-violet-600 hover:text-violet-800"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <fieldset disabled={!ready} className={!ready ? "opacity-60" : ""}>
        {/* Event picker */}
        <div className="mt-4">
          <input
            type="search"
            placeholder="Search events to generate for…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto pr-1">
            {filtered.slice(0, 12).map((o) => {
              const info = EVENT_INFO[o.eventName];
              const active = keyOf(o) === selected;
              return (
                <button
                  type="button"
                  key={keyOf(o)}
                  onClick={() => setSelected(keyOf(o))}
                  className={`flex w-full items-center gap-2.5 rounded-lg border p-2 text-left transition ${
                    active
                      ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                      : "border-slate-200 bg-white hover:border-violet-300"
                  }`}
                >
                  <span className="text-lg">{info?.icon ?? "📘"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {o.eventName}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {divisionShort(o.division)}
                    </span>
                  </span>
                  {active && <span className="text-violet-600">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Config */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Difficulty
            </span>
            <select
              className={selectClass}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Questions
            </span>
            <select
              className={selectClass}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {[3, 5, 8, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Topic focus (optional)
          </span>
          <input
            type="text"
            placeholder="e.g., Punnett squares, glacier types, redox…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={generate}
          disabled={!selectedOption || busy || !ready}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Generating…
            </>
          ) : (
            <>✨ Generate AI quiz</>
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Generates fresh questions; may take 10–40s depending on your model.
        </p>
      </fieldset>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "muted";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-slate-50 text-slate-500 ring-slate-200";
  return (
    <div className={`rounded-lg px-3 py-2 text-xs font-medium ring-1 ${cls}`}>
      {children}
    </div>
  );
}
