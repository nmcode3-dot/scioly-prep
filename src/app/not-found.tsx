import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <p className="font-display text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 text-slate-600">
        That event or page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Go home
        </Link>
        <Link
          href="/events"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Browse events
        </Link>
      </div>
    </div>
  );
}
