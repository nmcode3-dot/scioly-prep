"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  "Life & Personal Science",
  "Earth & Space Science",
  "Physical Science & Chemistry",
  "Inquiry & Nature of Science",
  "Technology & Engineering",
];

const TYPES = ["Study", "Lab", "Build"];

export function FilterForm({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== "all") {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      const qs = next.toString();
      router.replace(qs ? `/events?${qs}` : "/events");
    },
    [params, router],
  );

  const selectClass =
    "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  const current = (key: string) => params.get(key) ?? "all";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search events…"
            defaultValue={params.get("search") ?? ""}
            onChange={(e) => update("search", e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className={selectClass}
            value={current("division")}
            onChange={(e) => update("division", e.target.value)}
            aria-label="Division"
          >
            <option value="all">All divisions</option>
            <option value="B">Division B</option>
            <option value="C">Division C</option>
          </select>

          <select
            className={selectClass}
            value={current("season")}
            onChange={(e) => update("season", e.target.value)}
            aria-label="Season"
          >
            <option value="all">All seasons</option>
            <option value="2026">2025–26 (Current)</option>
            <option value="2027">2027 (Projected)</option>
            <option value="2025">2025 (Previous)</option>
          </select>

          <select
            className={selectClass}
            value={current("category")}
            onChange={(e) => update("category", e.target.value)}
            aria-label="Category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(" Science", "")}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={current("type")}
            onChange={(e) => update("type", e.target.value)}
            aria-label="Type"
          >
            <option value="all">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <span className="hidden text-sm font-medium text-slate-500 lg:inline">
            {total} event{total === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
