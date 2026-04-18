"use client";

import { useEffect, useState } from "react";

function getSecondsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function formatSeconds(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function Countdown() {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    setSecs(getSecondsUntilMidnightUTC());
    const id = window.setInterval(() => {
      setSecs(getSecondsUntilMidnightUTC());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (secs === null) return null;

  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        Next Brandle in
      </p>
      <p className="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
        {formatSeconds(secs)}
      </p>
    </div>
  );
}
