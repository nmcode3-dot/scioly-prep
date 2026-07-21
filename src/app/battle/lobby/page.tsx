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

interface OpenChallenge {
  id: number;
  username: string;
  emoji: string;
  rating: number;
  eventName: string;
  division: string;
  createdAt: string;
}

export default function BattleLobbyPage() {
  const router = useRouter();
  const { user, loading, openAuth, refresh } = useUser();
  const [busy, setBusy] = useState(false);
  const [busyName, setBusyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [eventName, setEventName] = useState("");
  const [division, setDivision] = useState<"B" | "C">("C");

  // Matchmaking state
  const [hosting, setHosting] = useState(false);
  const [challenges, setChallenges] = useState<OpenChallenge[]>([]);
  const [fightingId, setFightingId] = useState<number | null>(null);

  useEffect(() => {
    const div = sessionStorage.getItem("scioly.battle.division");
    const ev = sessionStorage.getItem("scioly.battle.event");
    setDivision((div as "B" | "C") ?? "C");
    setEventName(ev ?? "");
    setReady(true);
  }, []);

  // Poll the open-challenges feed + my host status every 3 seconds.
  useEffect(() => {
    if (!ready || !user) return;
    const poll = async () => {
      try {
        const [feedRes, statusRes] = await Promise.all([
          fetch("/api/matchmaking/feed", { cache: "no-store" }),
          fetch("/api/matchmaking/status", { cache: "no-store" }),
        ]);
        if (feedRes.ok) {
          const fd = await feedRes.json();
          setChallenges(Array.isArray(fd.requests) ? fd.requests : []);
        }
        if (statusRes.ok) {
          const sd = await statusRes.json();
          if (sd.matchId) {
            router.replace(`/battle/match/${sd.matchId}`);
          }
        }
      } catch {
        /* ignore */
      }
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [ready, user, router]);

  // Challenge a bot.
  const challenge = async (bot: (typeof BOT_ROSTER)[number]) => {
    if (!user) return openAuth("login");
    if (!eventName) return router.replace("/battle");
    setBusy(true);
    setBusyName(bot.nickname);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, division, season: BATTLE_SEASON, difficulty: "medium", count: BATTLE_QUESTIONS }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || "Couldn't generate battle questions.");
      }
      const questions = data.questions.map((q: ActiveBattle["questions"][number]) => ({
        prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, topic: q.topic,
      }));
      const payload: ActiveBattle = {
        eventName, division, season: BATTLE_SEASON, questions,
        opponent: { nickname: bot.nickname, emoji: bot.emoji, rating: botRating(bot.skill), isBot: true },
        botAnswers: simulateBot(questions, bot.skill),
      };
      setActiveBattle(payload);
      router.push("/battle/arena");
    } catch (err) {
      setBusy(false);
      setBusyName("");
      setError(err instanceof Error ? err.message : "Network error. Try again.");
    } finally {
      clearTimeout(timer);
    }
  };

  // Host a human match (post to the board).
  const host = async () => {
    if (!user) return openAuth("login");
    if (!eventName) return router.replace("/battle");
    setError(null);
    try {
      const res = await fetch("/api/matchmaking/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, division }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't host a match.");
      setHosting(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    }
  };

  const cancelHost = async () => {
    try {
      await fetch("/api/matchmaking/cancel", { method: "POST" });
    } catch {
      /* ignore */
    }
    setHosting(false);
  };

  // Accept someone else's open challenge.
  const fight = async (c: OpenChallenge) => {
    if (!user) return openAuth("login");
    setFightingId(c.id);
    setError(null);
    try {
      const res = await fetch("/api/matchmaking/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: c.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.matchId) throw new Error(data.error || "Couldn't start the match.");
      refresh();
      router.push(`/battle/match/${data.matchId}`);
    } catch (err) {
      setFightingId(null);
      setError(err instanceof Error ? err.message : "Network error.");
    }
  };

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🔐</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Log in to battle</h1>
        <button type="button" onClick={() => openAuth("login")} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Log in</button>
      </div>
    );
  }

  if (!ready || loading) return <div className="py-20 text-center text-slate-400">Loading lobby…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">⚔️ Battle Lobby</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">{user?.emoji} {user?.username}</h1>
          <p className="text-sm text-slate-500">Your event: {eventName} · Division {division} · 2025–26 rules</p>
        </div>
        <Link href="/battle" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">← Change setup</Link>
      </div>

      {/* Host / matchmaking */}
      <div className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
        {hosting ? (
          <div className="text-center">
            <span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="font-display text-lg font-semibold text-slate-900">Looking for a challenger…</p>
            <p className="mt-1 text-sm text-slate-500">Your match in <b>{eventName}</b> is live on the board. Anyone can accept it.</p>
            <button type="button" onClick={cancelHost} className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Play a real person</h3>
              <p className="text-sm text-slate-500">Host a match in {eventName} and wait for a challenger, or accept an open challenge below.</p>
            </div>
            <button type="button" onClick={host} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95">
              📣 Host a match
            </button>
          </div>
        )}
      </div>

      {/* Open challenges feed (refreshes every 3s) */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Open challenges — any topic</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> live · refreshes every 3s
          </span>
        </div>
        {challenges.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            No open challenges right now. Host one, or challenge a bot below. 👇
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {challenges.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl ring-1 ring-emerald-100">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">{c.username} <span className="text-[11px] font-bold text-slate-400">★ {c.rating}</span></p>
                  <p className="truncate text-xs text-slate-500">{c.eventName} · Div {c.division}</p>
                </div>
                <button type="button" disabled={fightingId !== null} onClick={() => fight(c)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                  {fightingId === c.id ? "…" : "⚔️ Fight"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bots */}
      <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">Or challenge a bot</p>
      <p className="mt-1 text-xs text-slate-400">Always available for solo practice — they answer in real time based on their skill.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BOT_ROSTER.map((b) => (
          <button key={b.nickname} type="button" disabled={busy} onClick={() => challenge(b)} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:opacity-60">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl ring-1 ring-slate-100">{b.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">{b.nickname}</p>
              <p className="truncate text-xs text-slate-500">{b.blurb}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1"><SkillBar skill={b.skill} /><span className="text-[10px] font-medium text-slate-400">{skillLabel(b.skill)}</span></div>
                <span className="text-[11px] font-bold text-slate-500">{botRating(b.skill)}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-violet-600 opacity-0 transition group-hover:opacity-100">⚔️</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

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
