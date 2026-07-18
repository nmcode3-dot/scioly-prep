import type { QuizQ } from "@/lib/quiz-session";

/** Battles use the CURRENT season rules only. */
export const BATTLE_SEASON = "2026";
export const BATTLE_QUESTIONS = 5;

export interface BattleAnswer {
  selectedIndex: number;
  timeMs: number;
}

export interface BattleQuestion extends QuizQ {}

export interface BotDef {
  nickname: string;
  emoji: string;
  skill: number;
  blurb: string;
}

/** The roster of "online" opponents you can challenge (simulated players). */
export const BOT_ROSTER: BotDef[] = [
  { nickname: "Quantum Quokka", emoji: "🦘", skill: 0.5, blurb: "Energetic, occasionally lucky" },
  { nickname: "Sir Isaac Bot", emoji: "🍎", skill: 0.82, blurb: "Calculates gravity in its sleep" },
  { nickname: "DNA Dynamo", emoji: "🧬", skill: 0.66, blurb: "Lives and breathes genetics" },
  { nickname: "Lord Voltage", emoji: "⚡", skill: 0.58, blurb: "Quick on the buzzer" },
  { nickname: "Madame Curie", emoji: "☢️", skill: 0.75, blurb: "Radiates confidence" },
  { nickname: "The Taxonomist", emoji: "🦋", skill: 0.7, blurb: "Never forgets a family" },
  { nickname: "Rock Solid", emoji: "🪨", skill: 0.45, blurb: "Tough but slow" },
  { nickname: "Cosmic Coder", emoji: "🛸", skill: 0.62, blurb: "From another galaxy" },
];

export interface ClientBattle {
  eventName: string;
  division: string;
  season: string;
  questions: BattleQuestion[];
  home: { nickname: string; emoji: string };
  away: {
    nickname: string;
    emoji: string;
    isBot: boolean;
    skill: number;
    answers: BattleAnswer[];
  };
}

export interface Judgment {
  homeCorrect: number;
  awayCorrect: number;
  homeTime: number;
  awayTime: number;
  winner: "home" | "away" | "tie";
}

/** Simulate a bot's answers + per-question response times. Pure & client-safe. */
export function simulateBot(
  questions: BattleQuestion[],
  skill: number,
): BattleAnswer[] {
  return questions.map((q) => {
    const correct = Math.random() < skill;
    let selectedIndex: number;
    if (correct) {
      selectedIndex = q.correctIndex;
    } else {
      const wrong = [0, 1, 2, 3].filter((i) => i !== q.correctIndex);
      selectedIndex = wrong[Math.floor(Math.random() * wrong.length)] ?? 0;
    }
    // Better skill → faster (and tighter) response.
    const base = 11000 - skill * 5500; // ~5.5s (elite) to ~11s (weak)
    const timeMs = Math.round(base + (Math.random() - 0.5) * 4000);
    return {
      selectedIndex,
      timeMs: Math.max(2500, Math.min(18000, timeMs)),
    };
  });
}

function scoreOf(answers: BattleAnswer[], questions: BattleQuestion[]) {
  let correct = 0;
  let timeMs = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] && answers[i].selectedIndex === questions[i].correctIndex) {
      correct++;
    }
    timeMs += answers[i]?.timeMs ?? 0;
  }
  return { correct, timeMs };
}

/** Judge: correct answers first, then total time as tiebreaker. */
export function judge(
  homeAnswers: BattleAnswer[],
  battle: ClientBattle,
): Judgment {
  const h = scoreOf(homeAnswers, battle.questions);
  const a = scoreOf(battle.away.answers, battle.questions);
  let winner: Judgment["winner"];
  if (h.correct > a.correct) winner = "home";
  else if (a.correct > h.correct) winner = "away";
  else if (h.timeMs < a.timeMs) winner = "home";
  else if (a.timeMs < h.timeMs) winner = "away";
  else winner = "tie";
  return {
    homeCorrect: h.correct,
    awayCorrect: a.correct,
    homeTime: h.timeMs,
    awayTime: a.timeMs,
    winner,
  };
}

export function formatMs(ms: number): string {
  const s = ms / 1000;
  return `${s.toFixed(1)}s`;
}

export function skillLabel(s: number): string {
  if (s >= 0.8) return "Elite";
  if (s >= 0.65) return "Strong";
  if (s >= 0.5) return "Solid";
  return "Rookie";
}

// ── sessionStorage helpers (battle state lives in the browser) ──
const ACTIVE_KEY = "scioly.battle.active";

export function setActiveBattle(b: ClientBattle): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(b));
}

export function getActiveBattle(): ClientBattle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as ClientBattle) : null;
  } catch {
    return null;
  }
}

export function clearActiveBattle(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACTIVE_KEY);
}
