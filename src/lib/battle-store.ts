import { generateQuestions } from "@/lib/ai";
import { buildCuratedQuiz } from "@/lib/bank";

/** Battles use the CURRENT season rules only. */
export const BATTLE_SEASON = "2026";
export const BATTLE_QUESTIONS = 5;

export interface BattleAnswer {
  selectedIndex: number;
  timeMs: number;
}

export interface BattleQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface BattlePlayer {
  nickname: string;
  emoji: string;
  isBot: boolean;
  skill: number; // 0..1
  answers: BattleAnswer[]; // grows as the player answers
  finished: boolean;
}

export type BattleSide = "home" | "away";

export interface Battle {
  id: string;
  eventName: string;
  division: string;
  questions: BattleQuestion[];
  home: BattlePlayer;
  away: BattlePlayer;
  status: "preparing" | "active" | "finished";
  winner: BattleSide | "tie" | null;
  createdAt: number;
}

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

// ───────────────────────── In-memory stores ─────────────────────────
const globalForBattles = globalThis as typeof globalThis & {
  __battleStore?: {
    battles: Map<string, Battle>;
    lobby: Map<string, LobbyEntry>;
  };
};

const store =
  globalForBattles.__battleStore ?? {
    battles: new Map<string, Battle>(),
    lobby: new Map<string, LobbyEntry>(),
  };
globalForBattles.__battleStore = store;

export interface LobbyEntry {
  lobbyId: string;
  nickname: string;
  emoji: string;
  eventName: string;
  division: string;
  createdAt: number;
  /** set when someone challenges this player → they auto-join the battle */
  pendingBattleId?: string;
}

const LOBBY_TTL = 1000 * 60 * 15; // 15 min

function pruneLobby() {
  const now = Date.now();
  for (const [id, e] of store.lobby) {
    if (now - e.createdAt > LOBBY_TTL) store.lobby.delete(id);
  }
}

export function joinLobby(e: Omit<LobbyEntry, "lobbyId" | "createdAt">): string {
  pruneLobby();
  const lobbyId = crypto.randomUUID();
  store.lobby.set(lobbyId, { ...e, lobbyId, createdAt: Date.now() });
  return lobbyId;
}

export function heartbeatLobby(lobbyId: string): LobbyEntry | null {
  const e = store.lobby.get(lobbyId);
  if (!e) return null;
  e.createdAt = Date.now(); // keep alive
  return e;
}

export function leaveLobby(lobbyId: string) {
  store.lobby.delete(lobbyId);
}

export function listOpponents(eventName: string, division: string): {
  bots: BotDef[];
  players: LobbyEntry[];
} {
  pruneLobby();
  const players = Array.from(store.lobby.values()).filter(
    (p) =>
      p.eventName === eventName &&
      p.division === division &&
      !p.pendingBattleId,
  );
  return { bots: BOT_ROSTER, players };
}

/** Returns a pending battle id if this lobby player was challenged. */
export function getPendingBattle(lobbyId: string): string | null {
  const e = store.lobby.get(lobbyId);
  return e?.pendingBattleId ?? null;
}

/** Mark a matching lobby player as challenged so they auto-join the battle. */
export function assignChallenge(
  nickname: string,
  eventName: string,
  division: string,
  battleId: string,
): boolean {
  for (const e of store.lobby.values()) {
    if (e.nickname === nickname && e.eventName === eventName && e.division === division && !e.pendingBattleId) {
      e.pendingBattleId = battleId;
      return true;
    }
  }
  return false;
}

// ───────────────────────── Battle lifecycle ─────────────────────────

function simulateBot(
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

async function prepareQuestions(
  eventName: string,
  division: string,
): Promise<BattleQuestion[]> {
  // AI-generated, current-season rules; fall back to the curated bank.
  try {
    const { questions } = await generateQuestions({
      eventName,
      division,
      difficulty: "medium",
      count: BATTLE_QUESTIONS,
      season: BATTLE_SEASON,
    });
    return questions.map((q) => ({
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      topic: q.topic,
    }));
  } catch {
    const bank = buildCuratedQuiz(eventName, division, "medium", BATTLE_QUESTIONS);
    return bank.map((q) => ({
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      topic: q.topic,
    }));
  }
}

export async function createBattle(opts: {
  myNickname: string;
  myEmoji: string;
  opponent: { nickname: string; emoji: string; isBot: boolean; skill: number };
  eventName: string;
  division: string;
}): Promise<Battle> {
  const questions = await prepareQuestions(opts.eventName, opts.division);
  const id = crypto.randomUUID();
  const home: BattlePlayer = {
    nickname: opts.myNickname,
    emoji: opts.myEmoji,
    isBot: false,
    skill: 0,
    answers: [],
    finished: false,
  };
  const away: BattlePlayer = {
    nickname: opts.opponent.nickname,
    emoji: opts.opponent.emoji,
    isBot: opts.opponent.isBot,
    skill: opts.opponent.skill,
    answers: opts.opponent.isBot ? simulateBot(questions, opts.opponent.skill) : [],
    finished: opts.opponent.isBot,
  };
  const battle: Battle = {
    id,
    eventName: opts.eventName,
    division: opts.division,
    questions,
    home,
    away,
    status: "active",
    winner: null,
    createdAt: Date.now(),
  };
  store.battles.set(id, battle);
  return battle;
}

export function getBattle(id: string): Battle | null {
  return store.battles.get(id) ?? null;
}

function scoreOf(player: BattlePlayer, questions: BattleQuestion[]) {
  let correct = 0;
  let timeMs = 0;
  for (let i = 0; i < questions.length; i++) {
    if (player.answers[i] && player.answers[i].selectedIndex === questions[i].correctIndex) {
      correct++;
    }
    timeMs += player.answers[i]?.timeMs ?? 0;
  }
  return { correct, timeMs };
}

export function judge(battle: Battle): {
  homeCorrect: number;
  awayCorrect: number;
  homeTime: number;
  awayTime: number;
  winner: BattleSide | "tie";
} {
  const h = scoreOf(battle.home, battle.questions);
  const a = scoreOf(battle.away, battle.questions);
  let winner: BattleSide | "tie";
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

function maybeFinish(battle: Battle) {
  const homeDone = battle.home.answers.length >= battle.questions.length;
  const awayDone =
    battle.away.isBot || battle.away.answers.length >= battle.questions.length;
  if (homeDone && awayDone && battle.status !== "finished") {
    battle.status = "finished";
    battle.winner = judge(battle).winner;
  }
}

export function submitAnswer(
  battleId: string,
  side: BattleSide,
  selectedIndex: number,
  timeMs: number,
): Battle | null {
  const battle = store.battles.get(battleId);
  if (!battle || battle.status === "finished") return battle ?? null;
  const player = side === "home" ? battle.home : battle.away;
  const idx = player.answers.length;
  if (idx >= battle.questions.length) return battle;
  player.answers[idx] = { selectedIndex, timeMs };
  if (player.answers.length >= battle.questions.length) player.finished = true;
  maybeFinish(battle);
  return battle;
}

/** Mark a (real) opponent as having entered the battle. */
export function joinBattleAsAway(battleId: string): Battle | null {
  const battle = store.battles.get(battleId);
  if (!battle) return null;
  if (!battle.away.isBot) {
    battle.away.finished = battle.away.answers.length >= battle.questions.length;
  }
  return battle;
}

// ───────────────────────── Sanitized state for client ─────────────────────────
// Hides correct answers / explanations for questions the viewer hasn't answered
// yet, so they can't peek. Reveals the opponent's answer per question once the
// viewer has answered it.

export interface BattleStateView {
  id: string;
  eventName: string;
  division: string;
  status: Battle["status"];
  winner: Battle["winner"];
  me: {
    nickname: string;
    emoji: string;
    isBot: boolean;
    answers: BattleAnswer[];
    finished: boolean;
    answeredCount: number;
  };
  opp: {
    nickname: string;
    emoji: string;
    isBot: boolean;
    finished: boolean;
    answeredCount: number;
  };
  total: number;
  judgment: {
    homeCorrect: number;
    awayCorrect: number;
    homeTime: number;
    awayTime: number;
    winner: BattleSide | "tie";
  } | null;
  questions: Array<{
    prompt: string;
    options: string[];
    topic: string;
    /** only present after the viewer has answered this question */
    correctIndex?: number;
    explanation?: string;
    /** the opponent's answer for this question (revealed after you answer) */
    opp?: { selectedIndex: number; timeMs: number };
  }>;
}

export function viewFor(battle: Battle, side: BattleSide): BattleStateView {
  const me = side === "home" ? battle.home : battle.away;
  const opp = side === "home" ? battle.away : battle.home;
  const answered = me.answers.length;

  const questions = battle.questions.map((q, i) => {
    const base = { prompt: q.prompt, options: q.options, topic: q.topic };
    if (i < answered) {
      return {
        ...base,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        opp: opp.answers[i],
      };
    }
    return base;
  });

  return {
    id: battle.id,
    eventName: battle.eventName,
    division: battle.division,
    status: battle.status,
    winner: battle.winner,
    me: {
      nickname: me.nickname,
      emoji: me.emoji,
      isBot: me.isBot,
      answers: me.answers,
      finished: me.finished,
      answeredCount: answered,
    },
    opp: {
      nickname: opp.nickname,
      emoji: opp.emoji,
      isBot: opp.isBot,
      finished: opp.finished,
      answeredCount: opp.answers.length,
    },
    total: battle.questions.length,
    judgment: battle.status === "finished" ? judge(battle) : null,
    questions,
  };
}

export function formatMs(ms: number): string {
  const s = ms / 1000;
  return `${s.toFixed(1)}s`;
}
