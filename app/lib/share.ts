import { DIFFICULTY, type Difficulty } from "./difficulty";
import { evaluateGuess, type TileState } from "./game";

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
  won: boolean,
  category: string,
  practice = false,
  difficulty: Difficulty = "medium"
): string {
  const num = getPuzzleNumber();
  const score = won
    ? `${guesses.length}/${DIFFICULTY[difficulty].maxGuesses}`
    : `X/${DIFFICULTY[difficulty].maxGuesses}`;
  const marker = DIFFICULTY[difficulty].shareMarker;
  const lines = guesses.map((g) =>
    evaluateGuess(g, answer)
      .map((s) => EMOJI[s])
      .join("")
  );
  const diffLabel = difficulty !== "medium" ? ` · ${DIFFICULTY[difficulty].label}` : "";
  const header = practice
    ? `Brandle · ${answer.length} letters · ${category}${diffLabel} · ${score} (Practice)${marker ? " " + marker : ""}`
    : `Brandle #${num} · ${answer.length} letters · ${category}${diffLabel} · ${score}${marker ? " " + marker : ""}`;
  return [header, "", ...lines, "", "https://brandle.today"].join("\n");
}

function hasNavigator(): boolean {
  return typeof navigator !== "undefined";
}

export async function shareResult(text: string): Promise<"shared" | "copied" | "failed"> {
  if (hasNavigator() && navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "failed";
      }
      // Fall back to copying if native share is rejected or unavailable.
    }
  }

  return (await copyToClipboard(text)) ? "copied" : "failed";
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (hasNavigator() && navigator.clipboard?.writeText) {
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
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
