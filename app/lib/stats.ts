import { MAX_GUESSES } from "./game";
import { getPuzzleNumber } from "./share";
import type { Difficulty } from "./difficulty";

const PROGRESS_KEY = "brandle.progress.v1";

function statsKey(difficulty: Difficulty): string {
  return `brandle.stats.${difficulty}.v1`;
}

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
  difficulty: Difficulty;
};

export const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
  lastCompleted: null,
};

export function loadStats(difficulty: Difficulty = "medium"): Stats {
  if (typeof window === "undefined") return EMPTY_STATS;
  try {
    // One-time migration: copy old medium stats if medium key is empty.
    if (difficulty === "medium") {
      const oldKey = "brandle.stats.v1";
      const mediumKey = statsKey("medium");
      if (!window.localStorage.getItem(mediumKey) && window.localStorage.getItem(oldKey)) {
        const oldRaw = window.localStorage.getItem(oldKey)!;
        window.localStorage.setItem(mediumKey, oldRaw);
        window.localStorage.removeItem(oldKey);
      }
    }
    const raw = window.localStorage.getItem(statsKey(difficulty));
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

export function saveStats(stats: Stats, difficulty: Difficulty = "medium"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(statsKey(difficulty), JSON.stringify(stats));
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

export function loadProgress(difficulty: Difficulty): DailyProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as DailyProgress;
    if (p.puzzleNumber !== getPuzzleNumber()) return null;
    if (p.difficulty !== difficulty) return null;
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
