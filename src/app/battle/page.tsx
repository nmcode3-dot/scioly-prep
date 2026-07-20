"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";

export default function BattleSetupPage() {
  const router = useRouter();
  const { user, loading, openAuth } = useUser();
  const [events, setEvents] = useState<{ name: string; division: "B" | "C" }[]>([]);
  const [division, setDivision] = useState<"B" | "C">("C");
  const [eventName, setEventName] = useState("");
  const [evLoading, setEvLoading] = useState(true);

  useEffect(() => {
    fetch("/api/battle-events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(Array.isArray(d.events) ? d.events : []);
        if (Array.isArray(d.events) && d.events.length > 0) {
          setEventName(d.events[0].name);
        }
      })
      .catch(() => {})
      .finally(() => setEvLoading(false));

    const savedDiv = sessionStorage.getItem("scioly.battle.division");
    if (savedDiv === "B" || savedDiv === "C") setDivision(savedDiv);
    const savedEvent = sessionStorage.getItem("scioly.battle.event");
    if (savedEvent) setEventName(savedEvent);
  }, []);

  const visibleEvents = events.filter((e) => e.division === division);

  const start = () => {
    if (!user || !eventName) return;
    sessionStorage.setItem("scioly.battle.division", division);
    sessionStorage.setItem("scioly.battle.event", eventName);
    router.push("/battle/lobby");
  };

  // Not logged in → prompt.
  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
          Log in to battle
        </h1>
        <p className="mt-2 text-slate-600">
          Create an account (just a username and password) to challenge opponents
          and build your rating.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => openAuth("signup")}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

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
            {user?.rating}
          </span>
          <span className="text-xs font-medium text-slate-500">your rating · {user?.emoji} {user?.username}</span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
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
                <span className="block text-sm font-bold text-slate-800">Division {d}</span>
                <span className="block text-xs text-slate-500">{d === "B" ? "Middle school" : "High school"}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Event
          </span>
          {evLoading ? (
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

        <button
          type="button"
          onClick={start}
          disabled={!eventName}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⚔️ Find opponents
        </button>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-violet-700">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
