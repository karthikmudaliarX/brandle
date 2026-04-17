import { Tile } from "./Tile";
import { evaluateGuess, MAX_GUESSES, type TileState } from "../lib/game";

type GridProps = {
  answer: string;
  guesses: string[];
  current: string;
  invalidShake: boolean;
};

export function Grid({ answer, guesses, current, invalidShake }: GridProps) {
  const length = answer.length;
  const rows: { letters: string[]; states: TileState[]; isCurrent: boolean }[] = [];

  for (let r = 0; r < MAX_GUESSES; r++) {
    if (r < guesses.length) {
      const g = guesses[r];
      rows.push({
        letters: g.split(""),
        states: evaluateGuess(g, answer),
        isCurrent: false,
      });
    } else if (r === guesses.length) {
      const letters = current
        .padEnd(length, " ")
        .split("")
        .map((c) => (c === " " ? "" : c));
      const states: TileState[] = letters.map((l) => (l ? "pending" : "empty"));
      rows.push({ letters, states, isCurrent: true });
    } else {
      rows.push({
        letters: Array(length).fill(""),
        states: Array(length).fill("empty"),
        isCurrent: false,
      });
    }
  }

  // Cap tile width so very short brands don't produce huge tiles.
  const maxRowWidth = Math.min(60, 8.5 * length);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {rows.map((row, r) => (
        <div
          key={r}
          className={`grid w-full gap-1.5 ${row.isCurrent && invalidShake ? "animate-shake" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`,
            maxWidth: `${maxRowWidth}ch`,
          }}
        >
          {row.letters.map((letter, i) => (
            <Tile key={i} letter={letter} state={row.states[i]} />
          ))}
        </div>
      ))}
    </div>
  );
}
