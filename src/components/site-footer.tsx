import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
                ⚗
              </span>
              <span className="font-display text-[17px] font-bold tracking-tight text-slate-900">
                SciOly<span className="text-violet-600">Battle</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              A head-to-head Science Olympiad battle arena. Pick an event,
              challenge a ranked opponent, and duel best-of-five on the current
              season&apos;s rules. Win rating, climb the ladder.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Arena</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link className="hover:text-violet-700" href="/battle">
                  Start a battle
                </Link>
              </li>
              <li>
                <Link className="hover:text-violet-700" href="/">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Learn more</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <a
                  className="hover:text-brand-700"
                  href="https://www.soinc.org"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  soinc.org (official)
                </a>
              </li>
              <li>
                <a
                  className="hover:text-brand-700"
                  href="https://scioly.org"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Scioly.org wiki &amp; tests
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs leading-relaxed text-slate-500">
            Science Olympiad is a trademark of Science Olympiad, Inc. This is an
            independent study tool, not affiliated with or endorsed by Science
            Olympiad, Inc. Practice questions are original items written in the
            style of publicly available invitational tests and official rules
            manuals for educational use.
          </p>
        </div>
      </div>
    </footer>
  );
}
