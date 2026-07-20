"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";
import {
  getActiveBattle,
  judge,
  applyRating,
  formatMs,
  type ActiveBattle,
  type BattleAnswer,
  type Judgment,
} from "@/lib/battle-client";
import { updateRating } from "@/lib/account";
import { divisionShort } from "@/lib/ui";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface BattleResult {
  judgment: Judgment;
  ratingChange: { delta: number; oldRating: number; newRating: number };
}

export default function BattleArenaPage() {
  const router = useRouter();
  const { user, refresh } = useUser();
  const [battle, setBattle] = useState<ActiveBattle | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<BattleAnswer[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [botAnswered, setBotAnswered] = useState(0);
  const [result, setResult] = useState<BattleResult | null>(null);

  const qStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const b = getActiveBattle();
    if (!b) {
      router.replace("/battle");
      return;
    }
    setBattle(b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Per-question timer + bot answer scheduling.
  useEffect(() => {
    if (!battle) return;
    if (current >= battle.questions.length) return;
    qStartRef.current = Date.now();
    setElapsed(0);
    setRevealed(false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - qStartRef.current);
    }, 100);

    const botAns = battle.botAnswers[current];
    if (botAns) {
      const t = setTimeout(() => {
        setBotAnswered((c) => Math.min(battle.questions.length, c + 1));
      }, botAns.timeMs);
      botTimeouts.current.push(t);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, battle]);

  useEffect(() => {
    return () => botTimeouts.current.forEach(clearTimeout);
  }, []);

  const answer = (selectedIndex: number) => {
    if (!battle || revealed) return;
    const timeMs = Date.now() - qStartRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswers((prev) => [...prev, { selectedIndex, timeMs }]);
    setRevealed(true);
  };

  const finish = () => {
    if (!battle || !user) return;
    // Judge client-side (correctness, then time).
    const j = judge(answers, {
      eventName: battle.eventName,
      division: battle.division,
      season: battle.season,
      questions: battle.questions,
      home: { nickname: user.username, emoji: user.emoji },
      away: {
        nickname: battle.opponent.nickname,
        emoji: battle.opponent.emoji,
        isBot: true,
        skill: 0,
        rating: battle.opponent.rating,
        answers: battle.botAnswers,
      },
    });
    const change = applyRating(user.rating, battle.opponent.rating, j);
    updateRating(change.newRating); // persist locally
    setBotAnswered(battle.questions.length);
    setResult({ judgment: j, ratingChange: change });
    refresh();
  };

  const next = () => {
    if (!battle) return;
    if (current + 1 >= battle.questions.length) {
      finish();
    } else {
      setCurrent((c) => c + 1);
    }
  };

  if (!battle || !user) {
    return (
      <div className="py-24 text-center">
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm font-semibold text-slate-600">Loading battle…</p>
      </div>
    );
  }

  // ── RESULTS ──
  if (result) {
    const j = result.judgment;
    const won = j.winner === "home";
    const tie = j.winner === "tie";
    const rc = result.ratingChange;
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">{tie ? "🤝" : won ? "🏆" : "💪"}</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">
            {tie ? "It's a tie!" : won ? "Victory!" : "Good battle!"}
          </h1>
          <p className="mt-1 text-slate-500">
            {battle.eventName} · {divisionShort(battle.division)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <PlayerCard emoji={user.emoji} name={user.username} correct={j.homeCorrect} time={j.homeTime} total={battle.questions.length} highlight={won} />
            <PlayerCard emoji={battle.opponent.emoji} name={battle.opponent.nickname} correct={j.awayCorrect} time={j.awayTime} total={battle.questions.length} highlight={!won && !tie} />
          </div>

          {/* Rating change */}
          <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Rating</p>
              <p className="font-display text-lg font-bold text-slate-500 line-through">{rc.oldRating}</p>
            </div>
            <span className="text-slate-300">→</span>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">New</p>
              <p className="font-display text-2xl font-bold text-slate-900">{rc.newRating}</p>
            </div>
            <span className={`ml-1 rounded-full px-3 py-1 text-sm font-bold ${rc.delta >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {rc.delta >= 0 ? "+" : ""}{rc.delta}
            </span>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Judged on correct answers first, then total time. Rating scales with the opponent&apos;s rating and your margin of victory.
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
  const myAnswer = answers[current];
  const oppAnswer = battle.botAnswers[current];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <ScoreSide emoji={user.emoji} name="You" answered={answers.length} total={battle.questions.length} you />
        <div className="text-center">
          <p className="font-display text-sm font-bold text-slate-400">VS</p>
          <p className="text-[11px] text-slate-400">{formatMs(elapsed)}</p>
        </div>
        <ScoreSide emoji={battle.opponent.emoji} name={battle.opponent.nickname} answered={botAnswered} total={battle.questions.length} />
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {battle.questions.map((_, i) => (
          <span key={i} className={`h-2 w-8 rounded-full transition ${i < current ? "bg-violet-500" : i === current ? "bg-violet-300" : "bg-slate-200"}`} />
        ))}
      </div>

      {q && (
        <div className="mt-5 animate-float-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">{q.topic}</span>
            <span className="text-xs font-semibold text-slate-400">Q{current + 1} / {battle.questions.length}</span>
          </div>
          <p className="mt-3 text-lg font-medium leading-relaxed text-slate-900">{q.prompt}</p>

          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const chosen = myAnswer?.selectedIndex === i;
              const isCorrect = revealed && i === q.correctIndex;
              const isWrongPick = revealed && chosen && i !== q.correctIndex;
              let cls = "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-slate-50";
              if (revealed) {
                if (isCorrect) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
                else if (isWrongPick) cls = "border-rose-400 bg-rose-50 text-rose-800";
                else cls = "border-slate-200 bg-white text-slate-400";
              }
              return (
                <button type="button" key={i} disabled={revealed} onClick={() => answer(i)} className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${cls}`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-bold ring-1 ring-slate-200">{LETTERS[i]}</span>
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="mt-4 animate-float-up space-y-3">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Explanation</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{q.explanation}</p>
              </div>
              {oppAnswer && (
                <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-2.5 text-sm">
                  <span className="text-lg">{battle.opponent.emoji}</span>
                  <span className="font-medium text-slate-700">{battle.opponent.nickname}</span>
                  <span className="text-slate-500">
                    answered in <b>{formatMs(oppAnswer.timeMs)}</b> —{" "}
                    {oppAnswer.selectedIndex === q.correctIndex ? <span className="font-semibold text-emerald-600">correct ✓</span> : <span className="font-semibold text-rose-600">wrong ✕</span>}
                  </span>
                </div>
              )}
              <button type="button" onClick={next} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                {current + 1 >= battle.questions.length ? "See results →" : "Next question →"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreSide({ emoji, name, answered, total, you }: { emoji: string; name: string; answered: number; total: number; you?: boolean }) {
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

function PlayerCard({ emoji, name, correct, time, total, highlight }: { emoji: string; name: string; correct: number; time: number; total: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="text-3xl">{emoji}</div>
      <p className="mt-1 truncate text-sm font-bold text-slate-800">{name}</p>
      <p className="font-display text-2xl font-bold text-slate-900">{correct}/{total}</p>
      <p className="text-[11px] text-slate-400">{formatMs(time)} total</p>
    </div>
  );
}
