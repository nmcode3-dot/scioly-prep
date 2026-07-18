"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { categoryStyle, divisionShort } from "@/lib/ui";
import { buildCuratedQuiz } from "@/lib/bank";
import { setActiveQuiz, type ActiveQuiz } from "@/lib/quiz-session";

export interface BuilderOption {
  eventName: string;
  division: "B" | "C";
  count: number;
  icon: string;
  category: string;
}

const DIFFICULTIES = [
  { value: "medium", label: "Medium" },
  { value: "easy", label: "Easy" },
  { value: "hard", label: "Hard" },
  { value: "any", label: "Mixed" },
];

export function QuizBuilder({ options }: { options: BuilderOption[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [topic, setTopic] = useState("");
  const [season, setSeason] = useState("2026");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyOf = (o: BuilderOption) => `${o.eventName}|${o.division}`;
  const selectedOption = options.find((o) => keyOf(o) === selected) ?? null;
  const hasBank = (selectedOption?.count ?? 0) > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.eventName.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q),
    );
  }, [options, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, BuilderOption[]>();
    for (const o of filtered) {
      const arr = map.get(o.category) ?? [];
      arr.push(o);
      map.set(o.category, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const select = (o: BuilderOption) => {
    setSelected(keyOf(o));
    setError(null);
  };

  // Generate a fresh AI quiz on the spot.
  const generate = async () => {
    if (!selectedOption) return;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: selectedOption.eventName,
          division: selectedOption.division,
          season,
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
        eventName: selectedOption.eventName,
        division: selectedOption.division,
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

  // Pull from the curated question bank (client-side, no server call).
  const startBank = () => {
    if (!selectedOption) return;
    setError(null);
    const questions = buildCuratedQuiz(
      selectedOption.eventName,
      selectedOption.division,
      difficulty,
      count,
    );
    if (questions.length === 0) {
      setError("No curated questions for this event yet — try the AI generator!");
      return;
    }
    setActiveQuiz({
      eventName: selectedOption.eventName,
      division: selectedOption.division,
      difficulty,
      ai: false,
      questions,
    });
    router.push("/quiz");
  };

  const selectClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Event picker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search events (e.g., Anatomy, Fossils, Optics)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="mt-4 max-h-[460px] space-y-5 overflow-y-auto pr-1">
          {grouped.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              No events match “{query}”.
            </p>
          )}
          {grouped.map(([category, items]) => {
            const cat = categoryStyle(category);
            return (
              <div key={category}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {category}
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {items.map((o) => {
                    const active = keyOf(o) === selected;
                    return (
                      <button
                        type="button"
                        key={keyOf(o)}
                        onClick={() => select(o)}
                        className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                          active
                            ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                            : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xl ring-1 ring-slate-100">
                          {o.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-800">
                            {o.eventName}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {divisionShort(o.division)}
                          </span>
                        </span>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] text-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Config panel */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-slate-900">
            ✨ Generate a quiz
          </h3>

          {selectedOption ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-xl ring-1 ring-slate-100">
                {selectedOption.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedOption.eventName}
                </p>
                <p className="text-xs text-slate-500">
                  {divisionShort(selectedOption.division)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-slate-500 ring-1 ring-slate-100">
              Pick an event from the list to begin.
            </p>
          )}

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Season (rules focus)
              </span>
              <select
                className={selectClass}
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                disabled={!selectedOption}
              >
                <option value="2026">2025–26 (current rules)</option>
                <option value="2027">2027 (next-year rules)</option>
                <option value="2025">2024–25 (previous rules)</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Difficulty
                </span>
                <select
                  className={selectClass}
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  disabled={!selectedOption}
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
                  disabled={!selectedOption}
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
                disabled={!selectedOption}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </label>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={!selectedOption || busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Generating…
              </>
            ) : (
              <>✨ Give me a quiz</>
            )}
          </button>

          {hasBank && (
            <button
              type="button"
              onClick={startBank}
              disabled={!selectedOption || busy}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
            >
              📚 Or use the {selectedOption?.count}-question bank
            </button>
          )}
          <p className="mt-2 text-center text-[11px] text-slate-400">
            AI questions generate in ~10–20s.
          </p>
        </div>
      </div>
    </div>
  );
}
