import type { Difficulty } from "../lib/difficulty";
import { DIFFICULTY } from "../lib/difficulty";

type Props = {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled: boolean;
};

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const ACTIVE_CLASS: Record<Difficulty, string> = {
  easy: "bg-emerald-500 text-white",
  medium: "bg-amber-400 text-white",
  hard: "bg-rose-500 text-white",
};

export function DifficultySelector({ value, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
      {DIFFICULTIES.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          disabled={disabled}
          aria-pressed={value === d}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            value === d
              ? ACTIVE_CLASS[d]
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {DIFFICULTY[d].label}
        </button>
      ))}
    </div>
  );
}
