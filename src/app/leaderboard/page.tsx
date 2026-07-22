"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/user-provider";
import { ratingTier } from "@/lib/battle-client";

interface LeaderRow {
  rank: number;
  username: string;
  emoji: string;
  rating: number;
}
interface MeRank {
  rank: number;
  rating: number;
  username: string;
  emoji: string;
  inTop100: boolean;
}

export default function LeaderboardPage() {
  const { user, openAuth } = useUser();
  const [top, setTop] = useState<LeaderRow[]>([]);
  const [me, setMe] = useState<MeRank | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data.error || "Couldn't load the leaderboard.");
        } else {
          setTop(Array.isArray(data.top) ? data.top : []);
          setMe(data.me ?? null);
          setTotal(data.total ?? 0);
        }
      } catch {
        if (alive) setError("Network error.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 10000); // refresh every 10s
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          🏆 Global Leaderboard
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Top 100 Battlers
        </h1>
        <p className="mt-2 text-slate-600">
          Ranked by rating. Climb the ladder by beating higher-rated opponents.
          {total > 0 && <span className="block text-xs text-slate-400">{total.toLocaleString()} players ranked</span>}
        </p>
      </div>

      {/* Your rank card */}
      {!loading && user && me && (
        <div className={`mt-6 rounded-2xl border p-4 shadow-sm ${me.inTop100 ? "border-amber-200 bg-amber-50" : "border-violet-200 bg-violet-50"}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-2xl ring-1 ring-slate-100">{me.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your standing</p>
              <p className="font-display text-lg font-bold text-slate-900">
                {me.username} <span className="text-sm font-medium text-slate-400">· {ratingTier(me.rating).label}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-slate-900">#{me.rank}</p>
              <p className="text-xs font-medium text-slate-500">★ {me.rating}</p>
            </div>
          </div>
          {!me.inTop100 && (
            <p className="mt-2 text-center text-xs text-slate-500">
              You&apos;re outside the top 100 — win a few battles to climb in!
            </p>
          )}
        </div>
      )}
      {!loading && !user && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Log in to see your own ranking.</p>
          <button type="button" onClick={() => openAuth("login")} className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Log in
          </button>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
      )}

      {/* The board */}
      {loading ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white ring-1 ring-slate-100" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {top.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">No players ranked yet. Be the first!</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {top.map((row) => {
                const isMe = user && me && row.username === me.username;
                return (
                  <li
                    key={`${row.username}-${row.rank}`}
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-violet-50" : row.rank <= 3 ? "bg-amber-50/40" : ""}`}
                  >
                    <span className="w-10 shrink-0 text-center font-display text-sm font-bold text-slate-400">
                      {medal(row.rank) ?? `#${row.rank}`}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xl ring-1 ring-slate-100">{row.emoji}</span>
                    <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${isMe ? "text-violet-700" : "text-slate-800"}`}>
                      {row.username}{isMe && <span className="ml-1 text-xs font-medium text-violet-400">(you)</span>}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-slate-400">{ratingTier(row.rating).label}</span>
                    <span className="shrink-0 font-display text-base font-bold text-slate-900">★ {row.rating}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/battle" className="text-sm font-medium text-slate-500 hover:text-violet-700">⚔️ Battle to climb →</Link>
      </div>
    </div>
  );
}
