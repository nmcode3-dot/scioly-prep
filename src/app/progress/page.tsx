"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getHistory,
  setActiveResult,
  clearHistory,
  type GradedQuiz,
} from "@/lib/quiz-session";
import { DIFFICULTY_META, divisionShort } from "@/lib/ui";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ProgressPage() {
  const router = useRouter();
  const [history, setHistory] = useState<GradedQuiz[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setReady(true);
  }, []);

  const totalTaken = history.length;
  const avg =
    totalTaken > 0
      ? Math.round(
          (history.reduce((s, a) => s + a.score / (a.total || 1), 0) /
            totalTaken) *
            100,
        )
      : 0;
  const questionsAnswered = history.reduce((s, a) => s + a.total, 0);

  const review = (item: GradedQuiz) => {
    setActiveResult(item);
    router.push("/results");
  };

  if (!ready) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
          Your Progress
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Track every practice test
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Your attempts are saved automatically in this browser. Click any test
          to review the full answer key.
        </p>
      </div>

      {totalTaken > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Tests taken" value={String(totalTaken)} />
          <Stat label="Average score" value={`${avg}%`} />
          <Stat label="Questions answered" value={String(questionsAnswered)} />
        </div>
      )}

      {totalTaken === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl">📊</p>
          <h2 className="mt-3 font-display text-lg font-semibold text-slate-800">
            No attempts yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Complete a practice test and your results will appear here.
          </p>
          <Link
            href="/practice"
            className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start your first test
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Recent attempts
            </h2>
            <button
              type="button"
              onClick={() => {
                clearHistory();
                setHistory([]);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600"
            >
              Clear history
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {history.map((a, i) => {
              const pct =
                a.total && a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
              const diffMeta = DIFFICULTY_META[a.difficulty] ?? DIFFICULTY_META.any;
              const color =
                pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-rose-600";
              return (
                <button
                  type="button"
                  key={`${a.createdAt}-${i}`}
                  onClick={() => review(a)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md"
                >
                  <div className="w-14 shrink-0 text-center">
                    <p className={`font-display text-2xl font-bold ${color}`}>{pct}%</p>
                    <p className="text-[11px] text-slate-400">
                      {a.score}/{a.total}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {a.eventName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                        {divisionShort(a.division)}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 font-medium ring-1 ${diffMeta.soft}`}>
                        {diffMeta.label}
                      </span>
                      {a.ai && (
                        <span className="rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-700">
                          ✨ AI
                        </span>
                      )}
                      <span>{formatDate(a.createdAt)}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-slate-300">→</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}
