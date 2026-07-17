"use client";

import { useEffect, useState } from "react";
import {
  PROVIDER_PRESETS,
  getStoredConfig,
  setStoredConfig,
  clearStoredConfig,
  aiHeaders,
  type AiClientConfig,
} from "@/lib/ai-config";

export function AiSettingsDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (cfg: AiClientConfig) => void;
}) {
  const [providerId, setProviderId] = useState("groq");
  const [config, setConfig] = useState<AiClientConfig>(() => getStoredConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Refresh from storage whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setConfig(getStoredConfig());
      setTestResult(null);
      setTestOk(null);
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const applyProvider = (id: string) => {
    setProviderId(id);
    const preset = PROVIDER_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setConfig((c) => ({
      ...c,
      baseUrl: preset.baseUrl || c.baseUrl,
      model: preset.model || c.model,
    }));
    setTestResult(null);
    setTestOk(null);
  };

  const activePreset = PROVIDER_PRESETS.find((p) => p.id === providerId);

  const save = () => {
    setStoredConfig(config);
    onSaved(config);
    onClose();
  };

  const clear = () => {
    clearStoredConfig();
    setConfig(getStoredConfig());
    onSaved(getStoredConfig());
  };

  const test = async () => {
    setTesting(true);
    setTestResult(null);
    setTestOk(null);
    try {
      const res = await fetch("/api/ai-status", {
        headers: aiHeaders(config),
      });
      const data = await res.json();
      setTestResult(data.message ?? (data.configured ? "Reachable" : "Not configured"));
      setTestOk(Boolean(data.reachable));
    } catch (err) {
      setTestOk(false);
      setTestResult(err instanceof Error ? err.message : "Request failed");
    } finally {
      setTesting(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg">
              ✨
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                AI Settings
              </h2>
              <p className="text-xs text-slate-500">
                Connect a model to generate unlimited questions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {/* Provider */}
          <div>
            <span className={labelClass}>Provider</span>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {PROVIDER_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => applyProvider(p.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    providerId === p.id
                      ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                      : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block font-semibold text-slate-800">
                    {p.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">
                    {p.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* API key */}
          <div>
            <label className="block">
              <span className={labelClass}>API key</span>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="Paste your API key here…"
                  value={config.apiKey}
                  onChange={(e) => {
                    setConfig((c) => ({ ...c, apiKey: e.target.value }));
                    setTestOk(null);
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  className={`${inputClass} pr-16 font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            {activePreset?.id === "groq" && (
              <p className="mt-1.5 text-xs text-slate-500">
                Don&apos;t have one? Create a free key at{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-semibold text-brand-700 underline"
                >
                  console.groq.com/keys ↗
                </a>{" "}
                (no credit card).
              </p>
            )}
          </div>

          {/* Advanced: base URL + model */}
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className="transition group-open:rotate-90">▸</span>
              Advanced (base URL &amp; model)
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Base URL</span>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, baseUrl: e.target.value }))
                  }
                  spellCheck={false}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Model</span>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, model: e.target.value }))
                  }
                  spellCheck={false}
                  className={inputClass}
                />
              </label>
            </div>
          </details>

          {/* Test result */}
          {testResult && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ring-1 ${
                testOk
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-rose-200"
              }`}
            >
              {testOk ? "✓ " : "⚠ "}
              {testResult}
            </div>
          )}

          <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
            🔒 Your key is stored only in this browser (localStorage) on your
            device and is sent solely to generate questions. It never leaves
            your control.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-slate-400 hover:text-rose-600"
          >
            Clear saved key
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={test}
              disabled={testing || !config.apiKey.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {testing ? "Testing…" : "Test connection"}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!config.apiKey.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
