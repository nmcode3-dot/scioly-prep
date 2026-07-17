"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getActiveResult,
  type GradedQuiz,
} from "@/lib/quiz-session";
import { DIFFICULTY_META, divisionShort } from "@/lib/ui";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<GradedQuiz | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResult(getActiveResult());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Loading…</div>;
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-4xl">📊</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
          No result to show
        </h1>
        <p className="mt-2 text-slate-600">
          Take a quiz to see your score and full answer review here.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/practice"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Build a quiz
          </Link>
          <button
            type="button"
            onClick={() => router.push("/progress")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View history
          </button>
        </div>
      </div>
    );
  }

  const score = result.score;
  const total = result.total || 1;
  const pct = Math.round((score / total) * 100);
  const diffMeta = DIFFICULTY_META[result.difficulty] ?? DIFFICULTY_META.any;

  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const ringColor = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  const message =
    pct >= 90
      ? "Outstanding! You're ready for tournament day."
      : pct >= 75
        ? "Great work — you're well prepared."
        : pct >= 50
          ? "Solid effort. Review the misses below."
          : "Keep studying — every rep counts.";

  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Score summary */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold text-slate-900">{pct}%</span>
              <span className="text-xs font-medium text-slate-500">
                {score}/{total}
              </span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Test complete
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
              {result.eventName}
            </h1>
            <p className="mt-1.5 text-slate-600">{message}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {divisionShort(result.division)}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${diffMeta.soft}`}>
                {diffMeta.label}
              </span>
              {result.ai && (
                <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                  ✨ AI
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            ✨ New quiz
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Browse events
          </Link>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View history
          </Link>
        </div>
      </div>

      {/* Review */}
      <h2 className="mt-10 font-display text-xl font-bold text-slate-900">
        Answer review
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Read every explanation — that&apos;s where the learning happens.
      </p>

      <div className="mt-5 space-y-4">
        {result.questions.map((q, idx) => {
          const selected = result.answers[idx];
          const isCorrect = selected === q.correctIndex;
          return (
            <div
              key={idx}
              className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
                isCorrect ? "border-emerald-200" : "border-rose-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    isCorrect ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  {isCorrect ? "✓" : "✕"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Q{idx + 1}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {q.topic}
                    </span>
                  </div>
                  <p className="mt-1.5 font-medium leading-relaxed text-slate-900">
                    {q.prompt}
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {q.options.map((opt, i) => {
                      const correct = i === q.correctIndex;
                      const chosen = i === selected;
                      let cls = "border-slate-200 bg-white text-slate-600";
                      if (correct) cls = "border-emerald-300 bg-emerald-50 text-emerald-800";
                      else if (chosen) cls = "border-rose-300 bg-rose-50 text-rose-800";
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${cls}`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-[11px] font-bold">
                            {letters[i]}
                          </span>
                          <span className="font-medium">{opt}</span>
                          <span className="ml-auto text-xs font-semibold">
                            {correct ? "Correct answer" : chosen ? "Your answer" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Explanation
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {q.explanation}
                    </p>
                    {q.source && (
                      <p className="mt-2 text-[11px] text-slate-400">
                        Source: {q.source}
                        {result.model ? ` · ${result.model}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
