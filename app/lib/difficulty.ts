export type Difficulty = "easy" | "medium" | "hard";

export type DifficultyConfig = {
  maxGuesses: number;
  showCategory: boolean;
  showHint: boolean;
  shareMarker: string;
  label: string;
};

export const DIFFICULTY: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxGuesses: 8,
    showCategory: true,
    showHint: true,
    shareMarker: "🟢",
    label: "Easy",
  },
  medium: {
    maxGuesses: 6,
    showCategory: true,
    showHint: false,
    shareMarker: "",
    label: "Medium",
  },
  hard: {
    maxGuesses: 4,
    showCategory: false,
    showHint: false,
    shareMarker: "🔴",
    label: "Hard",
  },
};

const DIFFICULTY_KEY = "brandle.difficulty";

export function loadDifficulty(): Difficulty {
  if (typeof window === "undefined") return "medium";
  try {
    const raw = window.localStorage.getItem(DIFFICULTY_KEY);
    if (raw === "easy" || raw === "medium" || raw === "hard") return raw;
  } catch {}
  return "medium";
}

export function saveDifficulty(d: Difficulty): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DIFFICULTY_KEY, d);
  } catch {}
}
