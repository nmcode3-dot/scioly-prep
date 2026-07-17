"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setActiveQuiz, type ActiveQuiz } from "@/lib/quiz-session";

const DIFFICULTIES = [
  { value: "medium", label: "Medium" },
  { value: "easy", label: "Easy" },
  { value: "hard", label: "Hard" },
  { value: "any", label: "Mixed" },
];

/**
 * One-click "Give me a quiz" that generates a fresh AI quiz on the spot
 * (powered by the owner's server-side key) and launches it.
 */
export function GenerateQuizButton({
  eventName,
  division,
}: {
  eventName: string;
  division: string;
}) {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generate = async () => {
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          division,
          difficulty,
          count,
          topic: topic.trim() || undefined,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || "Generation failed. Please try again.");
      }
      const quiz: ActiveQuiz = {
        eventName,
        division,
        difficulty,
        ai: true,
        model: data.model,
        questions: data.questions,
      };
      setActiveQuiz(quiz);
      router.push("/quiz");
    } catch (err) {
      setBusy(false);
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "The AI took too long to respond. Try fewer questions or try again.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Couldn't reach the quiz service. Please try again.");
      }
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl text-white">
          ✨
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">
            AI Quiz Generator
          </h3>
          <p className="text-xs text-slate-500">
            Unlimited fresh questions, generated on demand.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-70"
      >
        {busy ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Generating your quiz…
          </>
        ) : (
          <>✨ Give me a quiz</>
        )}
      </button>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Generates in ~10–20s.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowAdvanced((s) => !s)}
        className="mt-3 w-full text-center text-xs font-semibold text-violet-700 hover:text-violet-900"
      >
        {showAdvanced ? "Hide options" : "Customize (difficulty, length, topic)"}
      </button>

      {showAdvanced && (
        <div className="mt-3 space-y-3 border-t border-violet-100 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Difficulty
              </span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {[3, 5, 8, 10, 15].map((n) => (
                  <option key={n} value={n}>
                    {n} questions
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Topic focus (optional)
            </span>
            <input
              type="text"
              placeholder="e.g., Punnett squares, glacier types…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        </div>
      )}
    </div>
  );
}
