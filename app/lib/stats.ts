import { MAX_GUESSES } from "./game";
import { getPuzzleNumber } from "./share";

const STORAGE_KEY = "brandle.stats.v1";
const PROGRESS_KEY = "brandle.progress.v1";

export type Stats = {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  // distribution[i] = number of wins on the (i+1)-th guess
  distribution: number[];
  // puzzleNumber of the last completed game (used for streak continuity)
  lastCompleted: number | null;
};

export type DailyProgress = {
  puzzleNumber: number;
  guesses: string[];
  status: "playing" | "won" | "lost";
};

export const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
  lastCompleted: null,
};

export function loadStats(): Stats {
  if (typeof window === "undefined") return EMPTY_STATS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw) as Stats;
    // Patch shape if distribution length drifted.
    if (!Array.isArray(parsed.distribution) || parsed.distribution.length !== MAX_GUESSES) {
      parsed.distribution = Array(MAX_GUESSES).fill(0);
    }
    return parsed;
  } catch {
    return EMPTY_STATS;
  }
}

export function saveStats(stats: Stats): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota / disabled storage
  }
}

// Apply a finished game to the stats, returning the new stats object.
// Idempotent on puzzleNumber — replaying the same day won't double-count.
export function recordGame(
  stats: Stats,
  puzzleNumber: number,
  won: boolean,
  guessCount: number
): Stats {
  if (stats.lastCompleted === puzzleNumber) return stats;
  const next: Stats = {
    ...stats,
    distribution: [...stats.distribution],
  };
  next.played += 1;
  if (won) {
    next.won += 1;
    if (guessCount >= 1 && guessCount <= MAX_GUESSES) {
      next.distribution[guessCount - 1] += 1;
    }
    // Streak continues if the previous completed puzzle was yesterday.
    const continues = stats.lastCompleted === puzzleNumber - 1;
    next.currentStreak = continues ? stats.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
  } else {
    next.currentStreak = 0;
  }
  next.lastCompleted = puzzleNumber;
  return next;
}

export function loadProgress(): DailyProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as DailyProgress;
    if (p.puzzleNumber !== getPuzzleNumber()) return null;
    return p;
  } catch {
    return null;
  }
}

export function saveProgress(progress: DailyProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function winRate(stats: Stats): number {
  if (stats.played === 0) return 0;
  return Math.round((stats.won / stats.played) * 100);
}
