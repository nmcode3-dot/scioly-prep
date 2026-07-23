"use client";

import { useState } from "react";

interface ReportQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Lets a player flag a question as wrong/illogical AFTER they've answered it.
 * The AI reviews their objection; if upheld, the question is disregarded in
 * scoring (the parent applies that via `onResolved`).
 */
export function QuestionReporter({
  question,
  matchReport,
  onResolved,
}: {
  question?: ReportQuestion;
  /** If set, review against the question stored in this match (human matches). */
  matchReport?: { matchId: number; questionIndex: number };
  onResolved: (upheld: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ upheld: boolean; verdict: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (reason.trim().length < 3) return;
    setLoading(true);
    setError(null);
    try {
      const payload = matchReport
        ? { matchId: matchReport.matchId, questionIndex: matchReport.questionIndex, reason: reason.trim() }
        : {
            prompt: question!.prompt,
            options: question!.options,
            correctIndex: question!.correctIndex,
            explanation: question!.explanation,
            reason: reason.trim(),
          };
      const res = await fetch("/api/question/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed.");
      setResult({ upheld: data.upheld, verdict: data.verdict });
      onResolved(Boolean(data.upheld));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setLoading(false);
    }
  };

  // Already resolved (upheld)
  if (result?.upheld) {
    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm">
        <p className="font-semibold text-amber-800">✅ Report upheld — this question is disregarded in scoring.</p>
        <p className="mt-0.5 text-xs text-amber-700">{result.verdict}</p>
      </div>
    );
  }
  // Already resolved (rejected)
  if (result && !result.upheld) {
    return (
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm">
        <p className="font-semibold text-slate-700">Report not upheld.</p>
        <p className="mt-0.5 text-xs text-slate-500">{result.verdict}</p>
        <button type="button" onClick={() => { setResult(null); setReason(""); setOpen(true); }} className="mt-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800">
          Report again with more detail
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-600"
      >
        🚩 Report this question as wrong/illogical
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Report this question
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Explain in simple words why the question or its answer is wrong. An AI arbiter reviews it — if it&apos;s flawed, it won&apos;t count against you.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="e.g., Option C is also correct because… / The question is ambiguous because…"
        className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={loading || reason.trim().length < 3}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Reviewing…
            </>
          ) : (
            "Submit report"
          )}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
