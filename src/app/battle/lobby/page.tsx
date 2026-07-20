"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";
import {
  BOT_ROSTER,
  BATTLE_QUESTIONS,
  BATTLE_SEASON,
  botRating,
  simulateBot,
  skillLabel,
  setActiveBattle,
  type ActiveBattle,
} from "@/lib/battle-client";

export default function BattleLobbyPage() {
  const router = useRouter();
  const { user, loading, openAuth } = useUser();
  const [busy, setBusy] = useState(false);
  const [busyName, setBusyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [eventName, setEventName] = useState("");
  const [division, setDivision] = useState<"B" | "C">("C");

  useEffect(() => {
    const div = sessionStorage.getItem("scioly.battle.division");
    const ev = sessionStorage.getItem("scioly.battle.event");
    setDivision((div as "B" | "C") ?? "C");
    setEventName(ev ?? "");
    setReady(true);
  }, []);

  const challenge = async (bot: (typeof BOT_ROSTER)[number]) => {
    if (!user) {
      openAuth("login");
      return;
    }
    if (!eventName) {
      router.replace("/battle");
      return;
    }
    setBusy(true);
    setBusyName(bot.nickname);
    setError(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      // Generate current-season questions (stateless server call), then simulate
      // the opponent client-side. No database needed.
      const res = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          division,
          season: BATTLE_SEASON,
          difficulty: "medium",
          count: BATTLE_QUESTIONS,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || "Couldn't generate battle questions.");
      }
      const questions = data.questions.map(
        (q: ActiveBattle["questions"][number]) => ({
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          topic: q.topic,
        }),
      );
      const payload: ActiveBattle = {
        eventName,
        division,
        season: BATTLE_SEASON,
        questions,
        opponent: {
          nickname: bot.nickname,
          emoji: bot.emoji,
          rating: botRating(bot.skill),
          isBot: true,
        },
        botAnswers: simulateBot(questions, bot.skill),
      };
      setActiveBattle(payload);
      router.push("/battle/arena");
    } catch (err) {
      setBusy(false);
      setBusyName("");
      if (err instanceof Error && err.name === "AbortError") {
        setError("The AI took too long. Try again.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error. Try again.");
      }
    } finally {
      clearTimeout(timer);
    }
  };

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🔐</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Log in to battle</h1>
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Log in
        </button>
      </div>
    );
  }

  if (!ready || loading) {
    return <div className="py-20 text-center text-slate-400">Loading lobby…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            ⚔️ Battle Lobby
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">
            {user?.emoji} {user?.username}
          </h1>
          <p className="text-sm text-slate-500">
            {eventName} · Division {division} · 2025–26 rules
          </p>
        </div>
        <Link
          href="/battle"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← Change setup
        </Link>
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Choose your opponent
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Each opponent races you in real time — they answer with realistic speed and
        accuracy based on their skill. Most correct wins; ties broken by speed.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BOT_ROSTER.map((b) => (
          <button
            key={b.nickname}
            type="button"
            disabled={busy}
            onClick={() => challenge(b)}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:opacity-60"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl ring-1 ring-slate-100">
              {b.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">{b.nickname}</p>
              <p className="truncate text-xs text-slate-500">{b.blurb}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <SkillBar skill={b.skill} />
                  <span className="text-[10px] font-medium text-slate-400">{skillLabel(b.skill)}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">{botRating(b.skill)}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-violet-600 opacity-0 transition group-hover:opacity-100">⚔️</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
      )}

      {busy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-6 text-center shadow-xl">
            <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="text-sm font-semibold text-slate-700">Challenging {busyName}…</p>
            <p className="text-xs text-slate-400">Generating 2025–26 questions</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillBar({ skill }: { skill: number }) {
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${Math.round(skill * 100)}%` }} />
    </div>
  );
}
