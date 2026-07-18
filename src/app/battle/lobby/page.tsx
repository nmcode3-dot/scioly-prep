"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BotDef, LobbyEntry } from "@/lib/battle-store";

export default function BattleLobbyPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [emoji, setEmoji] = useState("🦊");
  const [eventName, setEventName] = useState("");
  const [division, setDivision] = useState<"B" | "C">("C");
  const [lobbyId, setLobbyId] = useState("");
  const [bots, setBots] = useState<BotDef[]>([]);
  const [players, setPlayers] = useState<LobbyEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // load saved setup
  useEffect(() => {
    const nick = sessionStorage.getItem("scioly.battle.nick");
    const em = sessionStorage.getItem("scioly.battle.emoji");
    const div = sessionStorage.getItem("scioly.battle.division");
    const ev = sessionStorage.getItem("scioly.battle.event");
    if (!nick || !ev) {
      router.replace("/battle");
      return;
    }
    setNickname(nick);
    setEmoji(em ?? "🦊");
    setDivision((div as "B" | "C") ?? "C");
    setEventName(ev);
    setReady(true);
  }, [router]);

  // join lobby + poll opponents + check for being challenged
  useEffect(() => {
    if (!ready) return;
    let myLobbyId = "";

    fetch("/api/battle/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, emoji, event: eventName, division }),
    })
      .then((r) => r.json())
      .then((d) => {
        myLobbyId = d.lobbyId;
        setLobbyId(d.lobbyId);
      })
      .catch(() => {});

    const poll = setInterval(() => {
      const qs = new URLSearchParams({ event: eventName, division, lobbyId: myLobbyId });
      fetch(`/api/battle/lobby?${qs.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          setBots(d.bots ?? []);
          setPlayers(d.players ?? []);
          if (d.challengedBattleId) {
            clearInterval(poll);
            router.push(`/battle/arena/${d.challengedBattleId}?side=away`);
          }
        })
        .catch(() => {});
    }, 2500);
    // initial fetch
    fetch(`/api/battle/lobby?event=${encodeURIComponent(eventName)}&division=${division}`)
      .then((r) => r.json())
      .then((d) => {
        setBots(d.bots ?? []);
        setPlayers(d.players ?? []);
      })
      .catch(() => {});

    return () => {
      clearInterval(poll);
      if (myLobbyId) {
        fetch(`/api/battle/lobby?lobbyId=${myLobbyId}`, { method: "DELETE" }).catch(() => {});
      }
    };
  }, [ready, nickname, emoji, eventName, division, router]);

  const challenge = async (opp: { nickname: string; emoji: string; isBot: boolean; skill: number }) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/battle/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myNickname: nickname,
          myEmoji: emoji,
          opponent: opp,
          eventName,
          division,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.battleId) {
        setError(data.error ?? "Couldn't start the battle.");
        setBusy(false);
        return;
      }
      if (lobbyId) {
        fetch(`/api/battle/lobby?lobbyId=${lobbyId}`, { method: "DELETE" }).catch(() => {});
      }
      router.push(`/battle/arena/${data.battleId}?side=home`);
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  };

  if (!ready) {
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
            {emoji} {nickname}
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
        Practicing solo? Challenge a simulated opponent — they answer in real time with realistic speed and skill.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {bots.map((b) => (
          <button
            key={b.nickname}
            type="button"
            disabled={busy}
            onClick={() => challenge({ nickname: b.nickname, emoji: b.emoji, isBot: true, skill: b.skill })}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:opacity-60"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl ring-1 ring-slate-100">
              {b.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">{b.nickname}</p>
              <p className="truncate text-xs text-slate-500">{b.blurb}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <SkillBar skill={b.skill} />
                <span className="text-[10px] font-medium text-slate-400">
                  {skillLabel(b.skill)}
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-violet-600 opacity-0 transition group-hover:opacity-100">
              ⚔️
            </span>
          </button>
        ))}
      </div>

      {players.length > 0 && (
        <>
          <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Online players in this event
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {players.map((p) => (
              <button
                key={p.lobbyId}
                type="button"
                disabled={busy}
                onClick={() =>
                  challenge({ nickname: p.nickname, emoji: p.emoji, isBot: false, skill: 0.6 })
                }
                className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 disabled:opacity-60"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl ring-1 ring-emerald-100">
                  {p.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">{p.nickname}</p>
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online now
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600">⚔️</span>
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      {busy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-6 text-center shadow-xl">
            <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="text-sm font-semibold text-slate-700">Preparing battle…</p>
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
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
        style={{ width: `${Math.round(skill * 100)}%` }}
      />
    </div>
  );
}

function skillLabel(s: number): string {
  if (s >= 0.8) return "Elite";
  if (s >= 0.65) return "Strong";
  if (s >= 0.5) return "Solid";
  return "Rookie";
}
