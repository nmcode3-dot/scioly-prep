"use client";

import { useEffect, useRef, useState } from "react";
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

interface OpenHost {
  id: number;
  username: string;
  emoji: string;
  rating: number;
  eventName: string;
  division: string;
}
interface IncomingCh {
  id: number;
  fromUsername: string;
  fromEmoji: string;
  eventName: string;
  division: string;
}
interface OutgoingCh {
  id: number;
  toUsername: string;
  eventName: string;
  status: string;
  matchId: number | null;
}

export default function BattleLobbyPage() {
  const router = useRouter();
  const { user, loading, openAuth } = useUser();
  const [ready, setReady] = useState(false);
  const [eventName, setEventName] = useState("");
  const [division, setDivision] = useState<"B" | "C">("C");

  const [hosting, setHosting] = useState(false);
  const [hosts, setHosts] = useState<OpenHost[]>([]);
  const [incoming, setIncoming] = useState<IncomingCh[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingCh | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // "host" | challenge hostId | "accept:id" | etc.
  const dismissedDecline = useRef<number | null>(null);

  useEffect(() => {
    const div = sessionStorage.getItem("scioly.battle.division");
    const ev = sessionStorage.getItem("scioly.battle.event");
    setDivision((div as "B" | "C") ?? "C");
    setEventName(ev ?? "");
    setReady(true);
  }, []);

  // Poll feed + incoming + outgoing every 3s.
  useEffect(() => {
    if (!ready || !user) return;
    const poll = async () => {
      try {
        const [f, i, o] = await Promise.all([
          fetch("/api/matchmaking/feed", { cache: "no-store" }),
          fetch("/api/matchmaking/incoming", { cache: "no-store" }),
          fetch("/api/matchmaking/outgoing", { cache: "no-store" }),
        ]);
        if (f.ok) {
          const fd = await f.json();
          setHosts(Array.isArray(fd.requests) ? fd.requests : []);
        }
        if (i.ok) {
          const id = await i.json();
          setIncoming(Array.isArray(id.challenges) ? id.challenges : []);
        }
        if (o.ok) {
          const od = await o.json();
          const ch: OutgoingCh | null = od.challenge ?? null;
          if (ch && ch.status === "accepted" && ch.matchId) {
            router.replace(`/battle/match/${ch.matchId}`);
            return;
          }
          if (ch && ch.status === "declined") {
            if (dismissedDecline.current !== ch.id) {
              dismissedDecline.current = ch.id;
              setNotice(`${ch.toUsername} declined your challenge.`);
              setOutgoing(null);
            }
          } else {
            setOutgoing(ch && ch.status === "pending" ? ch : null);
          }
        }
      } catch {
        /* ignore */
      }
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, router]);

  const host = async () => {
    if (!user) return openAuth("login");
    if (!eventName) return router.replace("/battle");
    setBusy("host");
    try {
      const res = await fetch("/api/matchmaking/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, division }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't host.");
      setHosting(true);
      setNotice(null);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Network error.");
    } finally {
      setBusy(null);
    }
  };

  const cancelHost = async () => {
    try {
      await fetch("/api/matchmaking/cancel", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    setHosting(false);
    setOutgoing(null);
    dismissedDecline.current = null;
  };

  const sendChallenge = async (h: OpenHost) => {
    if (!user) return openAuth("login");
    setBusy(`c-${h.id}`);
    setNotice(null);
    try {
      const res = await fetch("/api/matchmaking/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: h.id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send challenge.");
      setOutgoing({ id: data.challengeId, toUsername: data.toUsername, eventName: data.eventName, status: "pending", matchId: null });
      dismissedDecline.current = null;
      setHosting(false);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Network error.");
    } finally {
      setBusy(null);
    }
  };

  const accept = async (c: IncomingCh) => {
    setBusy(`a-${c.id}`);
    try {
      const res = await fetch("/api/matchmaking/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: c.id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.matchId) throw new Error(data.error || "Couldn't accept.");
      router.push(`/battle/match/${data.matchId}`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Network error.");
      setBusy(null);
    }
  };

  const decline = async (c: IncomingCh) => {
    setBusy(`d-${c.id}`);
    try {
      await fetch("/api/matchmaking/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: c.id }),
        credentials: "include",
      });
      setIncoming((arr) => arr.filter((x) => x.id !== c.id));
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  // Challenge a bot (instant, no accept needed).
  const challengeBot = async (bot: (typeof BOT_ROSTER)[number]) => {
    if (!user) return openAuth("login");
    if (!eventName) return router.replace("/battle");
    setBusy(`b-${bot.nickname}`);
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
      if (!res.ok || !Array.isArray(data.questions)) throw new Error(data.error || "Couldn't generate questions.");
      const questions = data.questions.map((q: ActiveBattle["questions"][number]) => ({
        prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, topic: q.topic,
      }));
      setActiveBattle({
        eventName, division, season: BATTLE_SEASON, questions,
        opponent: { nickname: bot.nickname, emoji: bot.emoji, rating: botRating(bot.skill), isBot: true },
        botAnswers: simulateBot(questions, bot.skill),
      });
      router.push("/battle/arena");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Network error.");
      setBusy(null);
    } finally {
      clearTimeout(timer);
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

      {/* Incoming challenges (must accept) */}
      {incoming.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">Incoming challenges</p>
          {incoming.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
              <span className="text-2xl">{c.fromEmoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{c.fromUsername} wants to fight!</p>
                <p className="text-xs text-slate-500">{c.eventName} · Div {c.division}</p>
              </div>
              <button type="button" disabled={busy !== null} onClick={() => accept(c)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                {busy === `a-${c.id}` ? "…" : "✓ Accept"}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => decline(c)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                {busy === `d-${c.id}` ? "…" : "✕ Decline"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Outgoing: waiting for accept */}
      {outgoing && (
        <div className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 text-center shadow-sm">
          <span className="mx-auto mb-2 block h-7 w-7 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="font-display text-lg font-semibold text-slate-900">Waiting for {outgoing.toUsername} to accept…</p>
          <p className="mt-1 text-sm text-slate-500">Challenge sent for {outgoing.eventName}. They must accept to start.</p>
          <button type="button" onClick={cancelHost} className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel challenge</button>
        </div>
      )}

      {/* Host control */}
      {!outgoing && (
        <div className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Play a real person</h3>
              <p className="text-sm text-slate-500">
                {hosting
                  ? "You're available on the board. Others can send you a challenge."
                  : `Host a match in ${eventName}, or send a challenge to someone below.`}
              </p>
            </div>
            {hosting ? (
              <button type="button" onClick={cancelHost} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Stop hosting</button>
            ) : (
              <button type="button" disabled={busy !== null} onClick={host} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50">
                {busy === "host" ? "…" : "📣 Host a match"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Open hosts feed */}
      {!outgoing && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Available players — any topic</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> live · refreshes every 3s
            </span>
          </div>
          {hosts.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              No one is hosting right now. Host a match and wait, or challenge a bot below. 👇
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hosts.map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl ring-1 ring-emerald-100">{h.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{h.username} <span className="text-[11px] font-bold text-slate-400">★ {h.rating}</span></p>
                    <p className="truncate text-xs text-slate-500">{h.eventName} · Div {h.division}</p>
                  </div>
                  <button type="button" disabled={busy !== null} onClick={() => sendChallenge(h)} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50">
                    {busy === `c-${h.id}` ? "…" : "📨 Challenge"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {notice && <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{notice}</p>}

      {/* Bots */}
      <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">Or challenge a bot (instant)</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BOT_ROSTER.map((b) => (
          <button key={b.nickname} type="button" disabled={busy !== null} onClick={() => challengeBot(b)} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:opacity-60">
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
