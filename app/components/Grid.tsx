import { Tile } from "./Tile";
import { evaluateGuess, MAX_GUESSES, type TileState } from "../lib/game";

type GridProps = {
  answer: string;
  guesses: string[];
  current: string;
  shakeKey: number;
};

export function Grid({ answer, guesses, current, shakeKey }: GridProps) {
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

  // Cap tile size to 52px so 6 rows fit on screen without scrolling.
  const MAX_TILE = 52;
  const GAP = 6; // gap-1.5 = 6px
  const maxRowWidth = Math.min(576, length * MAX_TILE + (length - 1) * GAP);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {rows.map((row, r) => (
        <div
          key={row.isCurrent ? `current-${shakeKey}` : r}
          className={`grid w-full gap-1.5 ${row.isCurrent && shakeKey > 0 ? "animate-shake" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`,
            maxWidth: `${maxRowWidth}px`,
          }}
        >
          {row.letters.map((letter, i) => (
            <Tile
              key={i}
              letter={letter}
              state={row.states[i]}
              delay={row.isCurrent ? 0 : i * 100}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
