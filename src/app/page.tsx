import Link from "next/link";
import { getCatalogEvents } from "@/lib/data";
import { EventCard } from "@/components/event-card";
import { categoryStyle } from "@/lib/ui";

export const dynamic = "force-dynamic";

const FEATURED = [
  "Anatomy & Physiology",
  "Astronomy",
  "Fossils",
  "Codebusters",
  "Disease Detectives",
  "Ecology",
];

const STEPS = [
  {
    icon: "🎯",
    title: "Choose your event",
    body: "Pick from every Division B & C event — across the current season and the projected next-year slate. Filter by category, too.",
  },
  {
    icon: "✨",
    title: "Hit “Give me a quiz”",
    body: "Our AI instantly generates fresh, exam-style questions for that event at your chosen difficulty and length — unlimited.",
  },
  {
    icon: "📈",
    title: "Get instant feedback",
    body: "Submit for an immediate score, a full answer key, and a clear explanation for every single question.",
  },
];

const CATEGORIES = [
  { name: "Life & Personal Science", emoji: "🧬", blurb: "Anatomy, genetics, ecology, microbes" },
  { name: "Earth & Space Science", emoji: "🪐", blurb: "Astronomy, fossils, dynamic planet, mapping" },
  { name: "Physical Science & Chemistry", emoji: "⚗️", blurb: "Chem lab, circuits, optics, materials" },
  { name: "Inquiry & Nature of Science", emoji: "🔬", blurb: "Codebusters, forensics, experimental design" },
  { name: "Technology & Engineering", emoji: "🔧", blurb: "Towers, vehicles, flight, robots" },
];

export default async function HomePage() {
  const catalog = await getCatalogEvents();

  const currentCount = catalog.filter((e) => e.season === "2026").length;
  const nextCount = catalog.filter((e) => e.season === "2027").length;

  // Pick featured events, preferring the current season (2026).
  const featured = FEATURED.map((name) => {
    const matches = catalog.filter((e) => e.name === name);
    return (
      matches.find((e) => e.season === "2026" && e.questionCount > 0) ??
      matches.find((e) => e.questionCount > 0) ??
      matches[0]
    );
  }).filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 backdrop-blur">
              ✨ AI-generated quizzes · 2025–26 season &amp; next year included
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Crush your Science Olympiad events.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
              Pick any event, hit “Give me a quiz,” and get a fresh,
              exam-style test generated instantly — with instant scoring and a
              clear explanation for every question. Unlimited practice, on
              demand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-700 shadow-lg shadow-brand-900/30 transition hover:bg-brand-50"
              >
                Start practicing free
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
              >
                Browse all events
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4">
              <HeroStat value="∞" label="AI-generated questions" />
              <HeroStat value={`${catalog.length}`} label="Events ready to quiz" />
              <HeroStat value={`${currentCount}`} label="Current-season events" />
              <HeroStat value={`${nextCount}`} label="Next-year events" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Three steps to tournament-ready
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="absolute right-5 top-5 font-display text-4xl font-bold text-slate-100">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                {s.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured events */}
      {featured.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                  Popular events
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Start with a fan favorite
                </h2>
              </div>
              <Link
                href="/events"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                View all {catalog.length} events →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Full coverage
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Every Science Olympiad category
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const cat = categoryStyle(c.name);
            const count = catalog.filter((e) => e.category === c.name).length;
            return (
              <Link
                key={c.name}
                href={`/events?category=${encodeURIComponent(c.name)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${cat.dot}`} />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-slate-900 group-hover:text-brand-700">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{c.blurb}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  {count} events →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Season CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SeasonCard
            badge="Current"
            title="2025–26 Season"
            body="Practice for the active series heading to Nationals at USC — including rotating topics like Dynamic Planet (cryosphere), Entomology, and the special-senses focus in Anatomy."
            count={currentCount}
            href="/events?season=2026"
            tone="brand"
          />
          <SeasonCard
            badge="Next year"
            title="2027 Projected Slate"
            body="Get a head start on next season. We include the projected event rotation so you can begin studying before official rules drop over the summer."
            count={nextCount}
            href="/events?season=2027"
            tone="accent"
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-14 text-center sm:px-12">
          <div className="absolute inset-0 bg-grid-dark opacity-30" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to find out where you stand?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Pick an event and run a practice test in under a minute. Your
              results and full answer key are saved automatically.
            </p>
            <Link
              href="/practice"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Build a practice test →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-white sm:text-3xl">
        {value}
      </p>
      <p className="text-xs font-medium text-brand-200">{label}</p>
    </div>
  );
}

function SeasonCard({
  badge,
  title,
  body,
  count,
  href,
  tone,
}: {
  badge: string;
  title: string;
  body: string;
  count: number;
  href: string;
  tone: "brand" | "accent";
}) {
  const ring =
    tone === "brand" ? "ring-brand-200" : "ring-accent-400/40";
  const badgeCls =
    tone === "brand"
      ? "bg-brand-100 text-brand-700"
      : "bg-accent-400/20 text-accent-500";
  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm ring-1 ${ring} transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${badgeCls}`}>
          {badge}
        </span>
        <span className="text-sm font-semibold text-slate-400">
          {count} events
        </span>
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
      <p className="mt-4 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
        Explore events →
      </p>
    </Link>
  );
}
