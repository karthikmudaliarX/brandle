"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Countdown } from "./Countdown";
import { Grid } from "./Grid";
import { Keyboard } from "./Keyboard";
import { StatsPanel } from "./Stats";
import { ThemeToggle } from "./ThemeToggle";
import {
  aggregateKeyStates,
  getDailyBrand,
  getRandomBrand,
  isValidGuess,
  MAX_GUESSES,
} from "../lib/game";
import { PUZZLE_BRANDS, type Brand } from "../lib/brands";
import { buildShareString, getPuzzleNumber, shareResult } from "../lib/share";
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
  const puzzleNumber = useMemo(() => getPuzzleNumber(), []);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [toast, setToast] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0); // increment to re-trigger animation
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<"daily" | "practice">("daily");
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const recordedRef = useRef(false);

  const answer = mode === "practice" && practiceAnswer ? practiceAnswer : brand.name;
  // Look up the practice brand object so we can show its category.
  const practiceBrand =
    mode === "practice" && practiceAnswer
      ? (PUZZLE_BRANDS.find((b) => b.name === practiceAnswer) ?? brand)
      : null;
  const activeBrand = practiceBrand ?? brand;
  const length = answer.length;

  // Hydrate stats and any in-progress game for today.
  useEffect(() => {
    const id = window.setTimeout(() => {
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
    }, 0);
    return () => window.clearTimeout(id);
  }, [puzzleNumber]);

  // Persist daily progress whenever guesses or status change (post-hydration).
  useEffect(() => {
    if (!hydrated) return;
    if (mode !== "daily") return;
    saveProgress({ puzzleNumber, guesses, status });
  }, [hydrated, puzzleNumber, guesses, status, mode]);

  // Record stats exactly once per finished game.
  useEffect(() => {
    if (!hydrated) return;
    if (status === "playing") return;
    if (mode !== "daily") return;
    if (recordedRef.current) return;
    recordedRef.current = true;
    setStats((prev) => {
      const next = recordGame(prev, puzzleNumber, status === "won", guesses.length);
      saveStats(next);
      return next;
    });
  }, [hydrated, status, puzzleNumber, guesses.length, mode]);

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

  const playAgain = useCallback(() => {
    const next = getRandomBrand(answer);
    setPracticeAnswer(next.name);
    setMode("practice");
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
    setShakeKey(0);
  }, [answer]);

  const returnToDaily = useCallback(() => {
    setMode("daily");
    setPracticeAnswer(null);
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
    setShakeKey(0);
    // Restore today's saved progress if it exists.
    const saved = loadProgress();
    if (saved && saved.puzzleNumber === puzzleNumber) {
      setGuesses(saved.guesses);
      setStatus(saved.status);
    }
  }, [puzzleNumber]);

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
    <div className="flex w-full max-w-xl flex-col items-center gap-3 px-4">
      <header className="relative flex w-full flex-col items-center gap-1 pt-4">
        <div className="absolute right-0 top-4">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-black tracking-tight">
          BRANDLE
          {mode === "practice" && (
            <span className="ml-2 align-middle text-xs font-semibold tracking-widest text-amber-500 uppercase">
              Practice
            </span>
          )}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Today&apos;s brand has{" "}
          <span className="font-bold text-neutral-900 dark:text-neutral-100">
            {length} letters
          </span>{" "}
          · category:{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {activeBrand.category}
          </span>
        </p>
        {!hydrated || stats.played === 0 ? (
          <Link
            href="/how-to-play"
            className="text-xs font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
          >
            New? How to play
          </Link>
        ) : null}
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
          activeBrand={activeBrand}
          stats={stats}
          hydrated={hydrated}
          mode={mode}
          onShare={async () => {
            const text = buildShareString(guesses, answer, status === "won");
            const result = await shareResult(text);
            showToast(
              result === "shared"
                ? "Shared"
                : result === "copied"
                  ? "Copied to clipboard"
                  : "Couldn't share"
            );
          }}
          onPlayAgain={playAgain}
          onReturnToDaily={returnToDaily}
        />
      )}
    </div>
  );
}

type EndPanelProps = {
  status: "won" | "lost";
  guesses: string[];
  answer: string;
  activeBrand: Brand;
  stats: Stats;
  hydrated: boolean;
  mode: "daily" | "practice";
  onShare: () => void;
  onPlayAgain: () => void;
  onReturnToDaily: () => void;
};

function EndPanel({
  status,
  guesses,
  answer,
  activeBrand,
  stats,
  hydrated,
  mode,
  onShare,
  onPlayAgain,
  onReturnToDaily,
}: EndPanelProps) {
  const num = getPuzzleNumber();
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-white/60 p-4 text-center text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
      {status === "won" ? (
        <div className="flex flex-col items-center gap-2">
          <p className="font-semibold text-emerald-600">
            Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}.
          </p>
          {activeBrand.fact && (
            <p className="text-xs italic text-neutral-500">💡 {activeBrand.fact}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-rose-600">The brand was:</p>
          <div className="flex max-w-full flex-wrap justify-center gap-1">
            {answer.split("").map((letter, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded bg-emerald-500 text-base font-bold uppercase text-white"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      )}
      {hydrated ? (
        <StatsPanel stats={stats} highlight={status === "won" ? guesses.length : null} />
      ) : (
        <div className="flex w-full flex-col gap-3">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-8 w-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-2 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-3 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-5 w-full animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700" />
              </div>
            ))}
          </div>
        </div>
      )}
      {mode === "daily" && (
        <>
          <Countdown />
          <p className="text-xs text-neutral-500">
            Brandle #{num} · {answer.length} letters · come back tomorrow.
          </p>
        </>
      )}
      {mode === "practice" && (
        <p className="text-xs text-neutral-500">
          Practice mode · {answer.length} letters · stats not counted
        </p>
      )}
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
        >
          Play Again
        </button>
        {mode === "daily" && (
          <button
            type="button"
            onClick={onShare}
            className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Share result
          </button>
        )}
        {mode === "practice" && (
          <button
            type="button"
            onClick={onReturnToDaily}
            className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            ← Today&apos;s puzzle
          </button>
        )}
      </div>
    </div>
  );
}
