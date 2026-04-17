import { PUZZLE_BRANDS, type Brand } from "./brands";

export type TileState = "correct" | "present" | "absent" | "empty" | "pending";
export const MAX_GUESSES = 6;

// Deterministic daily picker. Same date → same brand, regardless of timezone.
// We use UTC date to keep it stable globally.
export function getDailyBrand(date: Date = new Date()): Brand {
  const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  const seed = hashString(dayKey);
  const idx = seed % PUZZLE_BRANDS.length;
  return PUZZLE_BRANDS[idx];
}

// Simple stable string hash (xfnv1a-ish). Good enough for daily seed selection.
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// Evaluate a guess against an answer. Both must be uppercase, same length.
// Implements the standard Wordle two-pass algorithm so duplicate letters resolve correctly.
export function evaluateGuess(
  guess: string,
  answer: string
): TileState[] {
  if (guess.length !== answer.length) {
    throw new Error("evaluateGuess: length mismatch");
  }
  const result: TileState[] = Array(guess.length).fill("absent");
  const remaining: Record<string, number> = {};

  // First pass: greens.
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
    } else {
      remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
    }
  }
  // Second pass: yellows.
  for (let i = 0; i < answer.length; i++) {
    if (result[i] === "correct") continue;
    const ch = guess[i];
    if ((remaining[ch] ?? 0) > 0) {
      result[i] = "present";
      remaining[ch] -= 1;
    }
  }
  return result;
}

// Determine best per-letter state across all guesses (for the keyboard).
// Priority: correct > present > absent.
export function aggregateKeyStates(
  guesses: string[],
  answer: string
): Record<string, TileState> {
  const order: TileState[] = ["absent", "present", "correct"];
  const map: Record<string, TileState> = {};
  for (const guess of guesses) {
    const states = evaluateGuess(guess, answer);
    for (let i = 0; i < guess.length; i++) {
      const ch = guess[i];
      const prev = map[ch];
      if (!prev || order.indexOf(states[i]) > order.indexOf(prev)) {
        map[ch] = states[i];
      }
    }
  }
  return map;
}

// Allow any alphabetic word of the correct length — only the ANSWER is
// restricted to the curated brand list. Locking guesses to the brand list
// would leave players with ~19 valid guesses for a 5-letter puzzle.
export function isValidGuess(guess: string, length: number): boolean {
  if (guess.length !== length) return false;
  return /^[A-Z]+$/.test(guess);
}
