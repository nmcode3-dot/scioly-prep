"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addToHistory,
  setActiveResult,
  type ActiveQuiz,
} from "@/lib/quiz-session";
import { DIFFICULTY_META, divisionShort } from "@/lib/ui";

export function QuizRunner({ quiz }: { quiz: ActiveQuiz }) {
  const router = useRouter();
  const { questions, eventName, division, difficulty } = quiz;
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null).length,
    [answers],
  );
  const progress = Math.round((answeredCount / questions.length) * 100);
  const diffMeta = DIFFICULTY_META[difficulty] ?? DIFFICULTY_META.any;

  const q = questions[current];
  const letters = ["A", "B", "C", "D", "E", "F"];

  const choose = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
  };

  const go = (delta: number) =>
    setCurrent((c) => Math.min(questions.length - 1, Math.max(0, c + delta)));

  // Grade client-side, store the result, and go to the results page.
  const handleSubmit = () => {
    setSubmitting(true);
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctIndex) score += 1;
    }
    const graded = {
      ...quiz,
      answers,
      score,
      total: questions.length,
      createdAt: new Date().toISOString(),
    };
    addToHistory(graded);
    setActiveResult(graded);
    router.push("/results");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold text-slate-900">
            {eventName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-0.5">
              {divisionShort(division)}
            </span>
            <span className={`rounded-md px-2 py-0.5 ring-1 ${diffMeta.soft}`}>
              {diffMeta.label}
            </span>
            {quiz.ai && (
              <span className="rounded-md bg-violet-100 px-2 py-0.5 font-semibold text-violet-700">
                ✨ AI
              </span>
            )}
          </div>
        </div>
        <Link
          href="/events"
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Exit
        </Link>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Question {current + 1} of {questions.length}
          </span>
          <span>
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div key={current} className="mt-6 animate-float-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
            {q.topic}
          </span>
        </div>
        <p className="mt-3 text-lg font-medium leading-relaxed text-slate-900">
          {q.prompt}
        </p>

        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, i) => {
            const active = answers[current] === i;
            return (
              <button
                type="button"
                key={i}
                onClick={() => choose(i)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                  active
                    ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                    : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {letters[i]}
                </span>
                <span
                  className={`text-sm font-medium ${
                    active ? "text-violet-900" : "text-slate-700"
                  }`}
                >
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Palette */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {questions.map((_, i) => {
          const answered = answers[i] !== null;
          const isCurrent = i === current;
          return (
            <button
              type="button"
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to question ${i + 1}`}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                isCurrent
                  ? "bg-slate-900 text-white"
                  : answered
                    ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={current === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>←</span> Previous
        </button>

        {current < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Next <span aria-hidden>→</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Submitting…
              </>
            ) : (
              <>Submit test ✓</>
            )}
          </button>
        )}
      </div>

      {current === questions.length - 1 && answeredCount < questions.length && (
        <p className="mt-3 text-center text-xs text-slate-400">
          You can submit with unanswered questions ({questions.length - answeredCount} left blank).
        </p>
      )}
    </div>
  );
}
