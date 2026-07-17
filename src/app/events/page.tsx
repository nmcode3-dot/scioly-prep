import { Suspense } from "react";
import { getCatalogEvents } from "@/lib/data";
import { EventCard } from "@/components/event-card";
import { FilterForm } from "@/components/filter-form";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };

  const events = await getCatalogEvents({
    division: get("division"),
    season: get("season"),
    category: get("category"),
    type: get("type"),
    search: get("search"),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          Event Directory
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Every event, every division, every season
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Browse the full catalog for the current 2025–26 season and the
          projected next-year slate. Events with a question bank are ready to
          quiz right now.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-[68px] rounded-2xl bg-white/60" />}>
          <FilterForm total={events.length} />
        </Suspense>
      </div>

      {events.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-3xl">🔍</p>
          <p className="mt-3 font-semibold text-slate-700">
            No events match those filters
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try clearing a filter or searching for a different term.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">
            Every event can generate a fresh AI quiz on demand. Click any card
            to start.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={`${event.id}`} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
