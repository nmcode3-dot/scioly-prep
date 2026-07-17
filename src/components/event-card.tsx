import Link from "next/link";
import type { CatalogEvent } from "@/lib/types";
import {
  categoryStyle,
  SEASON_META,
  divisionShort,
  TYPE_META,
} from "@/lib/ui";

export function EventCard({ event }: { event: CatalogEvent }) {
  const cat = categoryStyle(event.category);
  const season = SEASON_META[event.season];
  const type = TYPE_META[event.type];

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-2xl ring-1 ring-slate-100">
          {event.icon}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
            {divisionShort(event.division)}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${season.badge}`}
            title={season.label}
          >
            {season.short}
          </span>
        </div>
      </div>

      <h3 className="mt-3.5 font-display text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
        {event.name}
      </h3>

      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
        {event.short}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${cat.soft}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
          {event.category.replace(" Science", "")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-100">
          {type.icon} {event.type}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-700">
          <span className="text-base leading-none">✨</span>
          Generate a quiz
        </span>
        <span className="text-[13px] font-semibold text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600">
          →
        </span>
      </div>
    </Link>
  );
}
