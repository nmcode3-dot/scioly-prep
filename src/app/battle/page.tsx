"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRating } from "@/lib/battle-client";

const EMOJIS = ["🦊", "🐼", "🐧", "🦁", "🐸", "🐙", "🦄", "🐯", "🦉", "🐲", "🦝", "🐳"];

export default function BattleSetupPage() {
  const router = useRouter();
  const [events, setEvents] = useState<{ name: string; division: "B" | "C" }[]>([]);
  const [nickname, setNickname] = useState("");
  const [emoji, setEmoji] = useState("🦊");
  const [division, setDivision] = useState<"B" | "C">("C");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    setRating(getRating());
    // restore saved nickname
    const saved = sessionStorage.getItem("scioly.battle.nick");
    if (saved) setNickname(saved);
    const savedEmoji = sessionStorage.getItem("scioly.battle.emoji");
    if (savedEmoji) setEmoji(savedEmoji);
    const savedDiv = sessionStorage.getItem("scioly.battle.division");
    if (savedDiv === "B" || savedDiv === "C") setDivision(savedDiv);

    // load distinct event names + divisions from the catalog
    fetch("/api/battle-events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(Array.isArray(d.events) ? d.events : []);
        if (Array.isArray(d.events) && d.events.length > 0) {
          const savedEvent = sessionStorage.getItem("scioly.battle.event");
          const match = d.events.find(
            (e: { name: string; division: string }) =>
              e.name === savedEvent && e.division === (savedDiv ?? "C"),
          );
          setEventName(match ? match.name : d.events[0].name);
        }
      })
      .catch(() => setError("Couldn't load events."))
      .finally(() => setLoading(false));
  }, []);

  const start = () => {
    if (!nickname.trim() || !eventName) {
      setError("Pick an event and enter a nickname.");
      return;
    }
    sessionStorage.setItem("scioly.battle.nick", nickname.trim());
    sessionStorage.setItem("scioly.battle.emoji", emoji);
    sessionStorage.setItem("scioly.battle.division", division);
    sessionStorage.setItem("scioly.battle.event", eventName);
    router.push("/battle/lobby");
  };

  const visibleEvents = events.filter((e) => e.division === division);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          ⚔️ Battle Mode
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Challenge an opponent
        </h1>
        <p className="mt-2 text-slate-600">
          Best of 5. Most correct answers wins — ties broken by speed. Current
          2025–26 season rules only.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
          <span className="text-amber-500">★</span>
          <span className="font-display text-lg font-bold text-slate-800">
            {rating ?? "—"}
          </span>
          <span className="text-xs font-medium text-slate-500">your rating</span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Nickname + avatar */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Your nickname (temporary)
          </span>
          <div className="flex gap-3">
            <select
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="h-11 w-16 rounded-xl border border-slate-200 bg-white px-2 text-center text-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {EMOJIS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <input
              type="text"
              maxLength={20}
              placeholder="e.g., BioBlaster"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </label>

        {/* Division */}
        <div className="mt-5">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Division
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["B", "C"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDivision(d);
                  const first = events.find((e) => e.division === d);
                  if (first) setEventName(first.name);
                }}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  division === d
                    ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                    : "border-slate-200 hover:border-violet-300"
                }`}
              >
                <span className="block text-sm font-bold text-slate-800">
                  Division {d}
                </span>
                <span className="block text-xs text-slate-500">
                  {d === "B" ? "Middle school" : "High school"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Event */}
        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Event
          </span>
          {loading ? (
            <div className="h-11 rounded-xl bg-slate-100" />
          ) : (
            <select
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {visibleEvents.map((e) => (
                <option key={`${e.name}-${e.division}`} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          )}
        </label>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={start}
          disabled={!nickname.trim() || !eventName}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⚔️ Find opponents
        </button>
      </div>

      <div className="mt-6 text-center">
        <Link href="/practice" className="text-sm font-medium text-slate-500 hover:text-violet-700">
          ← Back to practice
        </Link>
      </div>
    </div>
  );
}
