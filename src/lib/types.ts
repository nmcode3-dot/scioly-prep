export type Division = "B" | "C";
export type QDivision = "B" | "C" | "BC";
export type Season = "2025" | "2026" | "2027";
export type Difficulty = "easy" | "medium" | "hard" | "any";

export interface EventInfo {
  name: string;
  category: string;
  type: "Study" | "Lab" | "Build";
  short: string;
  long: string;
  icon: string;
}

export interface CatalogEvent extends EventInfo {
  id: number;
  slug: string;
  division: Division;
  season: Season;
  questionCount: number;
}

/** What the client sees for each question (correct answer hidden). */
export interface QuizQuestionPublic {
  id: number;
  prompt: string;
  options: string[];
  topic: string;
}

export interface QuizSubmission {
  eventName: string;
  season: string;
  division: string;
  difficulty: string;
  answers: { questionId: number; selectedIndex: number | null }[];
}

export interface GradedResponse {
  questionId: number;
  prompt: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  topic: string;
  source?: string | null;
}

export interface GradeResult {
  attemptId: number;
  score: number;
  total: number;
}
