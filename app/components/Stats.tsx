import { MAX_GUESSES } from "../lib/game";
import { winRate, type Stats } from "../lib/stats";

type StatsPanelProps = {
  stats: Stats;
  // Highlight this row in the distribution (the row the player just won on).
  highlight?: number | null;
};

export function StatsPanel({ stats, highlight }: StatsPanelProps) {
  const max = Math.max(1, ...stats.distribution);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Played" value={stats.played} />
        <Stat label="Win %" value={winRate(stats)} />
        <Stat label="Streak" value={stats.currentStreak} />
        <Stat label="Best" value={stats.maxStreak} />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Guess distribution
        </p>
        <div className="flex flex-col gap-1">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => {
            const count = stats.distribution[i] ?? 0;
            const widthPct = Math.max(6, Math.round((count / max) * 100));
            const isHighlight = highlight === i + 1;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-neutral-500">{i + 1}</span>
                <div
                  className={`flex h-5 items-center justify-end rounded-sm px-2 font-semibold text-white ${
                    isHighlight ? "bg-emerald-500" : "bg-neutral-500"
                  }`}
                  style={{ width: `${widthPct}%`, minWidth: "1.5rem" }}
                >
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-neutral-500">
        {label}
      </p>
    </div>
  );
}
