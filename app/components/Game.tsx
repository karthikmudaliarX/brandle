"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "./Grid";
import { Keyboard } from "./Keyboard";
import { StatsPanel } from "./Stats";
import {
  aggregateKeyStates,
  getDailyBrand,
  isValidGuess,
  MAX_GUESSES,
} from "../lib/game";
import { buildShareString, copyToClipboard, getPuzzleNumber } from "../lib/share";
import {
  EMPTY_STATS,
  loadProgress,
  loadStats,
  recordGame,
  saveProgress,
  saveStats,
  type Stats,
} from "../lib/stats";

type GameStatus = "playing" | "won" | "lost";

export function Game() {
  // Pick today's brand once per mount (deterministic by UTC date).
  const brand = useMemo(() => getDailyBrand(), []);
  const answer = brand.name;
  const length = answer.length;
  const puzzleNumber = useMemo(() => getPuzzleNumber(), []);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [toast, setToast] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0); // increment to re-trigger animation
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [hydrated, setHydrated] = useState(false);
  const recordedRef = useRef(false);

  // Hydrate stats and any in-progress game for today.
  useEffect(() => {
    setStats(loadStats());
    const progress = loadProgress();
    if (progress && progress.puzzleNumber === puzzleNumber) {
      setGuesses(progress.guesses);
      setStatus(progress.status);
      // If the saved game was already finished, mark as recorded so we don't
      // double-count when the next useEffect runs.
      if (progress.status !== "playing") {
        recordedRef.current = true;
      }
    }
    setHydrated(true);
  }, [puzzleNumber]);

  // Persist daily progress whenever guesses or status change (post-hydration).
  useEffect(() => {
    if (!hydrated) return;
    saveProgress({ puzzleNumber, guesses, status });
  }, [hydrated, puzzleNumber, guesses, status]);

  // Record stats exactly once per finished game.
  useEffect(() => {
    if (!hydrated) return;
    if (status === "playing") return;
    if (recordedRef.current) return;
    recordedRef.current = true;
    setStats((prev) => {
      const next = recordGame(prev, puzzleNumber, status === "won", guesses.length);
      saveStats(next);
      return next;
    });
  }, [hydrated, status, puzzleNumber, guesses.length]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;

      if (key === "ENTER") {
        if (current.length !== length) {
          setShakeKey((k) => k + 1);
          showToast(`Need ${length} letters`);
          return;
        }
        if (!isValidGuess(current, length)) {
          setShakeKey((k) => k + 1);
          showToast("Letters only");
          return;
        }
        const next = [...guesses, current];
        setGuesses(next);
        setCurrent("");
        if (current === answer) {
          setStatus("won");
          showToast("Got it!");
        } else if (next.length >= MAX_GUESSES) {
          setStatus("lost");
          showToast(answer);
        }
        return;
      }

      if (key === "BACK" || key === "BACKSPACE") {
        setCurrent((c) => c.slice(0, -1));
        return;
      }

      if (/^[A-Z]$/.test(key) && current.length < length) {
        setCurrent((c) => c + key);
      }
    },
    [answer, current, guesses, length, showToast, status]
  );

  // Physical keyboard.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKey(key === "BACKSPACE" ? "BACK" : key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const keyStates = useMemo(
    () => aggregateKeyStates(guesses, answer),
    [guesses, answer]
  );

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 px-4">
      <header className="flex w-full flex-col items-center gap-1 pt-4">
        <h1 className="text-3xl font-black tracking-tight">BRANDLE</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Today&apos;s brand has{" "}
          <span className="font-bold text-neutral-900 dark:text-neutral-100">
            {length} letters
          </span>{" "}
          · category:{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {brand.category}
          </span>
        </p>
      </header>

      <div className="relative w-full">
        <Grid
          answer={answer}
          guesses={guesses}
          current={current}
          shakeKey={shakeKey}
        />
        {toast && (
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white shadow dark:bg-neutral-100 dark:text-neutral-900">
            {toast}
          </div>
        )}
      </div>

      <Keyboard
        onKey={handleKey}
        states={keyStates}
        disabled={status !== "playing"}
      />

      {status !== "playing" && (
        <EndPanel
          status={status}
          guesses={guesses}
          answer={answer}
          stats={stats}
          onShare={async () => {
            const text = buildShareString(guesses, answer, status === "won");
            const ok = await copyToClipboard(text);
            showToast(ok ? "Copied to clipboard" : "Couldn't copy");
          }}
        />
      )}
    </div>
  );
}

type EndPanelProps = {
  status: "won" | "lost";
  guesses: string[];
  answer: string;
  stats: Stats;
  onShare: () => void;
};

function EndPanel({ status, guesses, answer, stats, onShare }: EndPanelProps) {
  const num = getPuzzleNumber();
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-white/60 p-4 text-center text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
      {status === "won" ? (
        <p className="font-semibold text-emerald-600">
          Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}.
        </p>
      ) : (
        <p className="font-semibold text-rose-600">
          The brand was <span className="font-black">{answer}</span>.
        </p>
      )}
      <StatsPanel stats={stats} highlight={status === "won" ? guesses.length : null} />
      <p className="text-xs text-neutral-500">
        Brandle #{num} · {answer.length} letters · come back tomorrow.
      </p>
      <button
        type="button"
        onClick={onShare}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
      >
        Share result
      </button>
    </div>
  );
}
