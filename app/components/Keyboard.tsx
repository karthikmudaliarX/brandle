import type { TileState } from "../lib/game";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

const KEY_STATE_CLASS: Record<TileState, string> = {
  correct: "bg-emerald-500 text-white",
  present: "bg-amber-400 text-white",
  absent: "bg-neutral-600 text-white",
  pending: "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100",
  empty: "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100",
};

type KeyboardProps = {
  onKey: (key: string) => void;
  states: Record<string, TileState>;
  disabled?: boolean;
};

export function Keyboard({ onKey, states, disabled }: KeyboardProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "BACK";
            const state = states[key] ?? "empty";
            const className = `${KEY_STATE_CLASS[state]} ${
              isWide ? "px-3 text-xs sm:text-sm" : "min-w-[8.5%] sm:min-w-[34px]"
            } flex h-10 flex-1 items-center justify-center rounded font-semibold uppercase transition-colors active:scale-95 disabled:opacity-60 sm:h-12`;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onKey(key)}
                disabled={disabled}
                className={className}
                aria-label={key}
              >
                {key === "BACK" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
