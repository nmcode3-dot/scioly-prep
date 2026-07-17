import { QUESTION_BANK } from "@/lib/questions-data";
import type { QuizQ } from "@/lib/quiz-session";

/** True if a question's division applies to the given competition division. */
export function matchesDivision(qDivision: string, division: string): boolean {
  return qDivision === "BC" || qDivision === division;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** How many curated questions exist for an event + division. */
export function curatedCountFor(eventName: string, division: string): number {
  return QUESTION_BANK.filter(
    (q) => q.eventName === eventName && matchesDivision(q.division, division),
  ).length;
}

/** Build a curated quiz from the in-source question bank (no database). */
export function buildCuratedQuiz(
  eventName: string,
  division: string,
  difficulty: string,
  count: number,
): QuizQ[] {
  let pool = QUESTION_BANK.filter(
    (q) => q.eventName === eventName && matchesDivision(q.division, division),
  );
  if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard") {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }
  const picked = shuffle(pool).slice(0, Math.max(1, count));
  return picked.map((q) => ({
    prompt: q.prompt,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    topic: q.topic,
    source: "Science Olympiad curated question bank",
  }));
}
