"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRating, ratingTier } from "@/lib/battle-client";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    const read = () => setRating(getRating());
    read();
    window.addEventListener("scioly-rating-change", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("scioly-rating-change", read);
      window.removeEventListener("focus", read);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const tier = rating !== null ? ratingTier(rating) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg font-bold text-white shadow-sm shadow-violet-600/30">
            ⚔
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-slate-900">
            SciOly<span className="text-violet-600">Battle</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive("/") ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Home
          </Link>
          <Link
            href="/battle"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive("/battle") ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Battle
          </Link>
        </div>

        <div className="hidden md:block">
          {rating !== null ? (
            <Link
              href="/battle"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              title={tier?.label}
            >
              <span className="text-amber-500">★</span>
              <span>{rating}</span>
              <span className="text-xs font-medium text-slate-400">{tier?.label}</span>
            </Link>
          ) : (
            <Link
              href="/battle"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              ⚔️ Start battling
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/" onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isActive("/") ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-100"}`}>
              Home
            </Link>
            <Link href="/battle" onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isActive("/battle") ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-100"}`}>
              Battle
            </Link>
            {rating !== null && (
              <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                ★ {rating} <span className="text-xs font-medium text-slate-400">{tier?.label}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
