"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";
import { QuestionReporter } from "@/components/question-reporter";
import { formatMs, type BattleAnswer, type Judgment } from "@/lib/battle-client";
import { divisionShort } from "@/lib/ui";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface MatchQuestion {
  prompt: string;
  options: string[];
  topic: string;
  correctIndex?: number;
  explanation?: string;
}
interface MatchView {
  id: number;
  eventName: string;
  division: string;
  status: "active" | "finished";
  me: { name: string; emoji: string; rating: number; submitted: boolean };
  opp: { name: string; emoji: string; rating: number; submitted: boolean };
  questions: MatchQuestion[];
  judgment?: Judgment;
  ratingChange?: { delta: number; oldRating: number; newRating: number };
}

export default function MatchArenaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { refresh } = useUser();
  const [matchId, setMatchId] = useState("");
  const [match, setMatch] = useState<MatchView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [disregarded, setDisregarded] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const qStart = useRef<number>(0);

  useEffect(() => {
    params.then((p) => setMatchId(p.id));
  }, [params]);

  const load = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch(`/api/match/${matchId}`, { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Match not found.");
      }
      const data = (await res.json()) as MatchView;
      setMatch(data);
      if (data.status === "finished") {
        refresh();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load match.");
    }
  }, [matchId, refresh]);

  useEffect(() => {
    load();
  }, [load]);

  // Start a timer for the current question (active, not yet submitted).
  useEffect(() => {
    if (!match || match.status !== "active" || match.me.submitted) return;
    if (current >= match.questions.length) return;
    qStart.current = Date.now();
  }, [match, current]);

  const choose = (i: number) => {
    setAnswers((p) => {
      const n = [...p];
      while (n.length <= current) n.push(null);
      n[current] = i;
      return n;
    });
  };

  const goNext = () => {
    if (!match) return;
    if (current < match.questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      submit();
    }
  };

  const submit = async () => {
    if (!match) return;
    setSubmitting(true);
    const payload: BattleAnswer[] = match.questions.map((_, i) => ({
      selectedIndex: answers[i] ?? -1,
      timeMs: 4000 + Math.floor(Math.random() * 4000), // placeholder timing for the play-through
    }));
    try {
      const res = await fetch(`/api/match/${matchId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload, disregard: Array.from(disregarded) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed.");
      await load(); // reload state (may be finished or waiting)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Poll while waiting for the opponent to finish.
  useEffect(() => {
    if (!match || match.status !== "finished") {
      if (match && match.me.submitted && !match.opp.submitted) {
        const t = setInterval(load, 3000);
        return () => clearInterval(t);
      }
    }
  }, [match, load]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-4xl">🤖</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">{loadError}</h1>
        <Link href="/battle/lobby" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Back to lobby</Link>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="py-24 text-center">
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm font-semibold text-slate-600">Loading match…</p>
      </div>
    );
  }

  // ── RESULTS ──
  if (match.status === "finished" && match.judgment && match.ratingChange) {
    const j = match.judgment;
    const won = j.winner === "home";
    const tie = j.winner === "tie";
    const rc = match.ratingChange;
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">{tie ? "🤝" : won ? "🏆" : "💪"}</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">{tie ? "It's a tie!" : won ? "Victory!" : "Good match!"}</h1>
          <p className="mt-1 text-slate-500">{match.eventName} · {divisionShort(match.division)}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Card emoji={match.me.emoji} name={match.me.name + " (you)"} correct={j.homeCorrect} time={j.homeTime} total={match.questions.length} highlight={won} />
            <Card emoji={match.opp.emoji} name={match.opp.name} correct={j.awayCorrect} time={j.awayTime} total={match.questions.length} highlight={!won && !tie} />
          </div>
          <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
            <p className="font-display text-lg font-bold text-slate-500 line-through">{rc.oldRating}</p>
            <span className="text-slate-300">→</span>
            <p className="font-display text-2xl font-bold text-slate-900">{rc.newRating}</p>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${rc.delta >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{rc.delta >= 0 ? "+" : ""}{rc.delta}</span>
          </div>

          {/* Answer review */}
          <div className="mt-8 text-left">
            <h2 className="font-display text-lg font-bold text-slate-900">Answer review</h2>
            <div className="mt-3 space-y-3">
              {match.questions.map((q, idx) => {
                const correct = q.correctIndex ?? 0;
                const mine = answers[idx];
                return (
                  <div key={idx} className={`rounded-xl border bg-white p-4 text-left ${mine === correct ? "border-emerald-200" : "border-rose-200"}`}>
                    <p className="text-sm font-medium text-slate-900">{idx + 1}. {q.prompt}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Correct: <b>{q.options[correct]}</b>
                      {mine != null && mine !== correct && <> · You: {q.options[mine]}</>}
                    </p>
                    {q.explanation && <p className="mt-1 text-xs text-slate-400">{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/battle/lobby" className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">⚔️ Back to lobby</Link>
            <Link href="/battle" className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">New event</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── WAITING FOR OPPONENT ──
  if (match.me.submitted && !match.opp.submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <span className="mx-auto mb-4 block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <h1 className="font-display text-2xl font-bold text-slate-900">Waiting for {match.opp.name}…</h1>
        <p className="mt-2 text-slate-500">They're still playing. Checking every 3 seconds.</p>
        <p className="mt-4 text-3xl">{match.me.emoji} ⚔️ {match.opp.emoji}</p>
      </div>
    );
  }

  // ── PLAY ──
  const q = match.questions[current];
  const answered = answers[current] != null;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{match.me.emoji}</span>
          <div><p className="text-sm font-bold text-slate-800">{match.me.name}</p><p className="text-[11px] text-slate-400">★ {match.me.rating}</p></div>
        </div>
        <p className="font-display text-sm font-bold text-slate-400">VS</p>
        <div className="flex items-center gap-2">
          <div className="text-right"><p className="text-sm font-bold text-slate-800">{match.opp.name}</p><p className="text-[11px] text-slate-400">★ {match.opp.rating}</p></div>
          <span className="text-2xl">{match.opp.emoji}</span>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {match.questions.map((_, i) => (
          <button key={i} type="button" onClick={() => setCurrent(i)} className={`h-2 w-8 rounded-full transition ${answers[i] != null ? "bg-violet-500" : i === current ? "bg-violet-300" : "bg-slate-200"}`} />
        ))}
      </div>

      {q && (
        <div className="mt-5 animate-float-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">{q.topic}</span>
            <span className="text-xs font-semibold text-slate-400">Q{current + 1} / {match.questions.length}</span>
          </div>
          <p className="mt-3 text-lg font-medium leading-relaxed text-slate-900">{q.prompt}</p>
          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const sel = answers[current] === i;
              return (
                <button type="button" key={i} onClick={() => choose(i)} className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${sel ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${sel ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>{LETTERS[i]}</span>
                  <span className={`text-sm font-medium ${sel ? "text-violet-900" : "text-slate-700"}`}>{opt}</span>
                </button>
              );
            })}
          </div>
          {answered && (
            <QuestionReporter
              matchReport={{ matchId: Number(matchId), questionIndex: current }}
              onResolved={(upheld) =>
                setDisregarded((prev) => {
                  const n = new Set(prev);
                  if (upheld) n.add(current);
                  return n;
                })
              }
            />
          )}
          <button type="button" onClick={goNext} disabled={!answered || submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? "Submitting…" : current + 1 >= match.questions.length ? "Submit answers →" : "Next question →"}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">Answers lock in when you submit — no peeking at the key.</p>
        </div>
      )}
    </div>
  );
}

function Card({ emoji, name, correct, time, total, highlight }: { emoji: string; name: string; correct: number; time: number; total: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="text-3xl">{emoji}</div>
      <p className="mt-1 truncate text-sm font-bold text-slate-800">{name}</p>
      <p className="font-display text-2xl font-bold text-slate-900">{correct}/{total}</p>
      <p className="text-[11px] text-slate-400">{formatMs(time)} total</p>
    </div>
  );
}
