import Link from "next/link";
import { getQuizPickOptions, getStats } from "@/lib/data";
import { EVENT_INFO } from "@/lib/events-data";
import { QuizBuilder, type BuilderOption } from "@/components/quiz-builder";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const [options, stats] = await Promise.all([
    getQuizPickOptions(),
    getStats(),
  ]);

  const builderOptions: BuilderOption[] = options.map((o) => {
    const info = EVENT_INFO[o.eventName];
    return {
      eventName: o.eventName,
      division: o.division,
      count: o.count,
      icon: info?.icon ?? "📘",
      category: info?.category ?? "Study",
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
          ✨ AI Quiz Generator
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Generate unlimited practice quizzes
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Pick your event and division, then hit{" "}
          <span className="font-semibold text-slate-800">“Give me a quiz”</span>{" "}
          to generate fresh, exam-style questions on demand — with instant
          scoring and a full explanation for every answer.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600 ring-1 ring-slate-200">
          📘 {builderOptions.length} quizzable events
        </span>
        <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600 ring-1 ring-slate-200">
          ❓ {stats.questionCount}+ practice questions
        </span>
        <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600 ring-1 ring-slate-200">
          🎯 {stats.eventCount} total events
        </span>
      </div>

      <div className="mt-8">
        <QuizBuilder options={builderOptions} />
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Where do the questions come from?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Every question is an original item written in the style of publicly
          available Science Olympiad invitational tests and the official rules
          manuals. For the full library of community-shared tests, we recommend
          the{" "}
          <a
            href="https://scioly.org"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-brand-700 underline"
          >
            Scioly.org Test Exchange
          </a>{" "}
          and the{" "}
          <a
            href="https://www.soinc.org"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-brand-700 underline"
          >
            official soinc.org resources
          </a>
          .
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Prefer to browse by event?{" "}
          <Link href="/events" className="font-semibold text-brand-700 underline">
            Open the event directory →
          </Link>
        </p>
      </div>
    </div>
  );
}
