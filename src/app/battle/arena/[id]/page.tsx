"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { BattleStateView } from "@/lib/battle-store";
import { formatMs } from "@/lib/battle-store";
import { divisionShort } from "@/lib/ui";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function BattleArenaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [battleId, setBattleId] = useState("");
  const [side, setSide] = useState<"home" | "away">("home");
  const [battle, setBattle] = useState<BattleStateView | null>(null);
  const [current, setCurrent] = useState(0);
  const [locked, setLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const qStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then((p) => setBattleId(p.id));
    const s = search.get("side");
    setSide(s === "away" ? "away" : "home");
  }, [params, search]);

  // load battle
  const loadBattle = useCallback(() => {
    if (!battleId) return;
    fetch(`/api/battle/${battleId}?side=${side}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setBattle(d))
      .catch(() => setLoadError("Battle not found or expired."));
  }, [battleId, side]);

  useEffect(() => {
    loadBattle();
  }, [loadBattle]);

  // start per-question timer when a new question becomes current
  useEffect(() => {
    if (!battle || battle.status === "finished") return;
    if (current >= battle.questions.length) return;
    qStartRef.current = Date.now();
    setElapsed(0);
    setLocked(false);
    setRevealed(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - qStartRef.current);
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [battle, current]);

  // poll for opponent progress (matters for human opponents) + final state
  useEffect(() => {
    if (!battleId || !battle) return;
    if (battle.status === "finished") return;
    const poll = setInterval(loadBattle, 2500);
    return () => clearInterval(poll);
  }, [battleId, battle, loadBattle]);

  const answer = async (selectedIndex: number) => {
    if (!battle || locked || revealed) return;
    const timeMs = Date.now() - qStartRef.current;
    setLocked(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await fetch(`/api/battle/${battleId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side, selectedIndex, timeMs }),
      });
      const data = await res.json();
      if (data.view) setBattle(data.view);
    } catch {
      /* ignore */
    }
    setRevealed(true);
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-4xl">🤖</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">{loadError}</h1>
        <Link href="/battle" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          Back to battle
        </Link>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="py-24 text-center">
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm font-semibold text-slate-600">Loading battle…</p>
      </div>
    );
  }

  // ── RESULTS ──
  if (battle.status === "finished") {
    const j = battle.judgment;
    const won = j?.winner === side;
    const tie = j?.winner === "tie";
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">{tie ? "🤝" : won ? "🏆" : "💪"}</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">
            {tie ? "It's a tie!" : won ? "Victory!" : "Good battle!"}
          </h1>
          <p className="mt-1 text-slate-500">{battle.eventName} · {divisionShort(battle.division)}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <PlayerCard
              emoji={battle.me.emoji}
              name={battle.me.nickname}
              correct={j ? (side === "home" ? j.homeCorrect : j.awayCorrect) : 0}
              time={j ? (side === "home" ? j.homeTime : j.awayTime) : 0}
              total={battle.total}
              highlight={won}
            />
            <PlayerCard
              emoji={battle.opp.emoji}
              name={battle.opp.nickname}
              correct={j ? (side === "home" ? j.awayCorrect : j.homeCorrect) : 0}
              time={j ? (side === "home" ? j.awayTime : j.homeTime) : 0}
              total={battle.total}
              highlight={!won && !tie}
            />
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Judged on correct answers first, then total time.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/battle/lobby" className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              ⚔️ Battle again
            </Link>
            <Link href="/battle" className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              New event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = battle.questions[current];
  const myAnswer = battle.me.answers[current];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Scoreboard */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <ScoreSide emoji={battle.me.emoji} name="You" answered={battle.me.answeredCount} total={battle.total} you />
        <div className="text-center">
          <p className="font-display text-sm font-bold text-slate-400">VS</p>
          <p className="text-[11px] text-slate-400">{formatMs(elapsed)}</p>
        </div>
        <ScoreSide emoji={battle.opp.emoji} name={battle.opp.nickname} answered={battle.opp.answeredCount} total={battle.total} />
      </div>

      {/* progress dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {battle.questions.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-8 rounded-full transition ${
              i < current ? "bg-violet-500" : i === current ? "bg-violet-300" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      {q && (
        <div className="mt-5 animate-float-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
              {q.topic}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Q{current + 1} / {battle.total}
            </span>
          </div>
          <p className="mt-3 text-lg font-medium leading-relaxed text-slate-900">{q.prompt}</p>

          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const chosen = myAnswer?.selectedIndex === i;
              const isCorrect = revealed && i === q.correctIndex;
              const isWrongPick = revealed && chosen && i !== q.correctIndex;
              let cls =
                "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-slate-50";
              if (revealed) {
                if (isCorrect) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
                else if (isWrongPick) cls = "border-rose-400 bg-rose-50 text-rose-800";
                else cls = "border-slate-200 bg-white text-slate-400";
              }
              return (
                <button
                  type="button"
                  key={i}
                  disabled={revealed}
                  onClick={() => answer(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${cls}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-bold ring-1 ring-slate-200">
                    {LETTERS[i]}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* reveal panel */}
          {revealed && (
            <div className="mt-4 animate-float-up space-y-3">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Explanation</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{q.explanation}</p>
              </div>
              {q.opp && (
                <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-2.5 text-sm">
                  <span className="text-lg">{battle.opp.emoji}</span>
                  <span className="font-medium text-slate-700">{battle.opp.nickname}</span>
                  <span className="text-slate-500">
                    answered in <b>{formatMs(q.opp.timeMs)}</b> —{" "}
                    {q.opp.selectedIndex === q.correctIndex ? (
                      <span className="font-semibold text-emerald-600">correct ✓</span>
                    ) : (
                      <span className="font-semibold text-rose-600">wrong ✕</span>
                    )}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCurrent((c) => c + 1)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {current + 1 >= battle.total ? "See results →" : "Next question →"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreSide({
  emoji,
  name,
  answered,
  total,
  you,
}: {
  emoji: string;
  name: string;
  answered: number;
  total: number;
  you?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${you ? "" : "flex-row-reverse text-right"}`}>
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="max-w-[120px] truncate text-sm font-bold text-slate-800">{name}</p>
        <p className="text-[11px] text-slate-400">{answered}/{total} answered</p>
      </div>
    </div>
  );
}

function PlayerCard({
  emoji,
  name,
  correct,
  time,
  total,
  highlight,
}: {
  emoji: string;
  name: string;
  correct: number;
  time: number;
  total: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="text-3xl">{emoji}</div>
      <p className="mt-1 truncate text-sm font-bold text-slate-800">{name}</p>
      <p className="font-display text-2xl font-bold text-slate-900">
        {correct}/{total}
      </p>
      <p className="text-[11px] text-slate-400">{formatMs(time)} total</p>
    </div>
  );
}
