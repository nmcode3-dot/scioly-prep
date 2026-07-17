"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveQuiz, type ActiveQuiz } from "@/lib/quiz-session";
import { QuizRunner } from "@/components/quiz-runner";

export default function QuizPage() {
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setQuiz(getActiveQuiz());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Loading…</div>;
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-4xl">🧪</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
          No quiz loaded
        </h1>
        <p className="mt-2 text-slate-600">
          Head to the practice builder to generate a fresh quiz.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/practice"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Build a quiz
          </Link>
          <Link
            href="/events"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Browse events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/practice" className="hover:text-violet-600">
              Practice
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-600">Test in progress</span>
            {quiz.ai && (
              <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-700">
                ✨ AI-generated
              </span>
            )}
            <span className="ml-auto hidden sm:inline">
              {quiz.questions.length} questions
            </span>
          </div>
        </div>
      </div>
      <QuizRunner quiz={quiz} />
    </div>
  );
}
