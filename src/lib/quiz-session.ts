/**
 * Client-side quiz state, stored in sessionStorage / localStorage so the app
 * works without any database. Safe to import from client components.
 */

export interface QuizQ {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  source?: string | null;
}

export interface ActiveQuiz {
  eventName: string;
  division: string;
  difficulty: string;
  ai: boolean;
  model?: string;
  questions: QuizQ[];
}

export interface GradedQuiz extends ActiveQuiz {
  answers: (number | null)[];
  score: number;
  total: number;
  createdAt: string;
}

const ACTIVE_QUIZ_KEY = "scioly.active-quiz";
const ACTIVE_RESULT_KEY = "scioly.active-result";
const HISTORY_KEY = "scioly.history";
const HISTORY_CAP = 50;

function readJSON<T>(key: string, storage: Storage): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown, storage: Storage): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function setActiveQuiz(q: ActiveQuiz): void {
  if (typeof window === "undefined") return;
  writeJSON(ACTIVE_QUIZ_KEY, q, sessionStorage);
}

export function getActiveQuiz(): ActiveQuiz | null {
  if (typeof window === "undefined") return null;
  return readJSON<ActiveQuiz>(ACTIVE_QUIZ_KEY, sessionStorage);
}

export function setActiveResult(r: GradedQuiz): void {
  if (typeof window === "undefined") return;
  writeJSON(ACTIVE_RESULT_KEY, r, sessionStorage);
}

export function getActiveResult(): GradedQuiz | null {
  if (typeof window === "undefined") return null;
  return readJSON<GradedQuiz>(ACTIVE_RESULT_KEY, sessionStorage);
}

export function getHistory(): GradedQuiz[] {
  if (typeof window === "undefined") return [];
  const arr = readJSON<GradedQuiz[]>(HISTORY_KEY, localStorage);
  return Array.isArray(arr) ? arr : [];
}

export function addToHistory(item: GradedQuiz): void {
  if (typeof window === "undefined") return;
  const arr = getHistory();
  arr.unshift(item);
  writeJSON(HISTORY_KEY, arr.slice(0, HISTORY_CAP), localStorage);
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}
