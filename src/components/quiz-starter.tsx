"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { buildCuratedQuiz } from "@/lib/bank";
import { setActiveQuiz } from "@/lib/quiz-session";

const DIFFICULTIES = [
  { value: "any", label: "Mixed difficulty" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

/** Curated question-bank launcher (no database required). */
export function QuizStarter({
  eventName,
  division,
  maxCount,
}: {
  eventName: string;
  division: string;
  season?: string;
  maxCount: number;
}) {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState("any");
  const [count, setCount] = useState(() => Math.min(10, Math.max(1, maxCount)));

  const counts = useMemo(() => {
    if (maxCount <= 0) return [1];
    const base = [5, 10, 15, 20].filter((n) => n <= maxCount);
    if (base.length === 0) base.push(maxCount);
    if (!base.includes(maxCount)) base.push(maxCount);
    return Array.from(new Set(base)).sort((a, b) => a - b);
  }, [maxCount]);

  const start = () => {
    const questions = buildCuratedQuiz(eventName, division, difficulty, count);
    if (questions.length === 0) return;
    setActiveQuiz({
      eventName,
      division,
      difficulty,
      ai: false,
      questions,
    });
    router.push("/quiz");
  };

  const selectClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-display text-base font-semibold text-slate-900">
        Question bank
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Pull from the curated set of {maxCount} vetted question
        {maxCount === 1 ? "" : "s"}.
      </p>

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
            {counts.map((n) => (
              <option key={n} value={n}>
                {n} questions
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={maxCount === 0}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        Start bank test
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
