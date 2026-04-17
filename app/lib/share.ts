import { evaluateGuess, MAX_GUESSES, type TileState } from "./game";

const EMOJI: Record<TileState, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
  pending: "⬜",
  empty: "⬜",
};

// Stable puzzle number relative to a fixed launch date.
// Counts UTC days elapsed since 2026-04-17 (project launch).
const LAUNCH_DATE_UTC = Date.UTC(2026, 3, 17); // month is 0-indexed

export function getPuzzleNumber(date: Date = new Date()): number {
  const today = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const days = Math.floor((today - LAUNCH_DATE_UTC) / 86_400_000);
  return Math.max(1, days + 1);
}

export function buildShareString(
  guesses: string[],
  answer: string,
  won: boolean
): string {
  const num = getPuzzleNumber();
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const lines = guesses.map((g) =>
    evaluateGuess(g, answer)
      .map((s) => EMOJI[s])
      .join("")
  );
  return [
    `Brandle #${num} · ${answer.length} letters · ${score}`,
    "",
    ...lines,
  ].join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to fallback
  }
  // Fallback for older browsers / insecure contexts.
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
