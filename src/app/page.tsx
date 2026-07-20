"use client";

import Link from "next/link";
import { BOT_ROSTER, botRating, ratingTier, skillLabel } from "@/lib/battle-client";
import { useUser } from "@/components/user-provider";

const STEPS = [
  { icon: "🎯", title: "Pick your event", body: "Choose any Division B or C event. Battles use the official 2025–26 season rules — Anatomy covers the nervous & endocrine systems, Dynamic Planet covers oceanography, and so on." },
  { icon: "⚔️", title: "Challenge an opponent", body: "Face off against ranked opponents who answer in real time. Each has a rating, a skill level, and a reaction speed." },
  { icon: "📈", title: "Climb the ratings", body: "Win to gain rating, lose to drop it. Beat higher-ranked opponents for bigger gains — your score scales with the matchup and your margin of victory." },
];

export default function HomePage() {
  const { user, openAuth } = useUser();
  const rating = user?.rating ?? null;
  const tier = rating !== null ? ratingTier(rating) : null;

  const startBattling = () => {
    if (!user) openAuth("signup");
    else window.location.href = "/battle";
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-800 text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 backdrop-blur">
              ⚔️ 1v1 Science Olympiad Battles · 2025–26 rules
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Battle your way to the top.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
              Pick an event, challenge a ranked opponent, and duel in a
              best-of-five. Most correct answers wins — ties broken by speed.
              Win rating, climb the ladder, become Grandmaster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startBattling}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-700 shadow-lg shadow-brand-900/30 transition hover:bg-brand-50"
              >
                {user ? "⚔️ Start battling" : "⚔️ Sign up to battle"}
                <span aria-hidden>→</span>
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {rating !== null ? (
                <RatingPill rating={rating} tierLabel={tier?.label ?? ""} />
              ) : (
                <BlankStat label="Your rating" value="—" />
              )}
              <BlankStat label="Questions per duel" value="Best of 5" />
              <BlankStat label="Judging" value="Correctness → time" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Three steps to the top of the ladder
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="absolute right-5 top-5 font-display text-4xl font-bold text-slate-100">{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{s.icon}</span>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Opponents preview */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Your rivals</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ranked opponents await
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BOT_ROSTER.slice(0, 8).map((b) => (
              <div key={b.nickname} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <div className="text-3xl">{b.emoji}</div>
                <p className="mt-1 truncate text-sm font-semibold text-slate-800">{b.nickname}</p>
                <p className="text-[11px] text-slate-400">{skillLabel(b.skill)}</p>
                <p className="mt-1 font-display text-lg font-bold text-brand-700">{botRating(b.skill)}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button type="button" onClick={startBattling} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800">
              ⚔️ Enter the arena
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function RatingPill({ rating, tierLabel }: { rating: number; tierLabel: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-white sm:text-3xl">{rating}</p>
      <p className="text-xs font-medium text-brand-200">Your rating · {tierLabel}</p>
    </div>
  );
}

function BlankStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-white sm:text-3xl">{value}</p>
      <p className="text-xs font-medium text-brand-200">{label}</p>
    </div>
  );
}
