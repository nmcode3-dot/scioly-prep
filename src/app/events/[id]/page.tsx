import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getCatalogEvents } from "@/lib/data";
import { QuizStarter } from "@/components/quiz-starter";
import { GenerateQuizButton } from "@/components/generate-quiz-button";
import {
  categoryStyle,
  SEASON_META,
  TYPE_META,
  divisionLabel,
  divisionShort,
} from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const num = Number(id);
  const event =
    Number.isFinite(num) && num > 0 ? await getEventById(num) : null;
  if (!event) notFound();

  const cat = categoryStyle(event.category);
  const season = SEASON_META[event.season] ?? SEASON_META["2026"];
  const type = TYPE_META[event.type] ?? TYPE_META.Study;
  const isProjected = event.season === "2027";

  // Find the same event across other seasons/divisions.
  const all = await getCatalogEvents();
  const related = all.filter(
    (e) => e.name === event.name && e.id !== event.id,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/events" className="hover:text-brand-600">
          ← All events
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div>
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-4xl ring-1 ring-slate-100">
              {event.icon}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${season.badge}`}
                >
                  {season.label}
                </span>
                <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {divisionShort(event.division)}
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {event.name}
              </h1>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cat.soft}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
              {event.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100">
              {type.icon} {type.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100">
              {divisionLabel(event.division)}
            </span>
          </div>

          <p className="mt-6 text-base leading-relaxed text-slate-700">
            {event.long || event.short}
          </p>

          {isProjected && (
            <div className="mt-5 rounded-xl border border-accent-400/40 bg-accent-400/10 p-4">
              <p className="text-sm font-semibold text-accent-500">
                ⚠ Projected event
              </p>
              <p className="mt-1 text-sm text-slate-600">
                The official next-season rules are released each summer. This
                listing reflects the projected slate based on the standard
                event rotation — confirm details on soinc.org once rules are
                published.
              </p>
            </div>
          )}

          {/* Related seasons/divisions */}
          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Also offered as
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => {
                  const rs = SEASON_META[r.season] ?? SEASON_META["2026"];
                  return (
                    <Link
                      key={r.id}
                      href={`/events/${r.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-slate-50"
                    >
                      <span className={`h-2 w-2 rounded-full ${rs.dot}`} />
                      {rs.short} · {divisionShort(r.division)}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <GenerateQuizButton eventName={event.name} division={event.division} />

          {/* Curated bank as a secondary option */}
          {event.questionCount > 0 && (
            <details className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">📚</span>
                  Use the question bank
                </span>
                <span className="text-slate-400 transition group-open:rotate-90">
                  ▸
                </span>
              </summary>
              <div className="mt-3">
                <QuizStarter
                  eventName={event.name}
                  division={event.division}
                  season={event.season}
                  maxCount={event.questionCount}
                />
              </div>
            </details>
          )}

          <a
            href="https://www.soinc.org"
            target="_blank"
            rel="noreferrer noopener"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            Official rules on soinc.org ↗
          </a>
        </div>
      </div>
    </div>
  );
}
