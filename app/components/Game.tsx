"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid } from "./Grid";
import { Keyboard } from "./Keyboard";
import {
  aggregateKeyStates,
  getDailyBrand,
  isValidGuess,
  MAX_GUESSES,
} from "../lib/game";

type GameStatus = "playing" | "won" | "lost";

export function Game() {
  // Pick today's brand once per mount (deterministic by UTC date).
  const brand = useMemo(() => getDailyBrand(), []);
  const answer = brand.name;
  const length = answer.length;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [toast, setToast] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;

      if (key === "ENTER") {
        if (current.length !== length) {
          setShake(true);
          window.setTimeout(() => setShake(false), 400);
          showToast(`Need ${length} letters`);
          return;
        }
        if (!isValidGuess(current, length)) {
          setShake(true);
          window.setTimeout(() => setShake(false), 400);
          showToast("Not in brand list");
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
          invalidShake={shake}
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
        <div className="text-center text-sm">
          {status === "won" ? (
            <p className="font-semibold text-emerald-600">
              Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}.
            </p>
          ) : (
            <p className="font-semibold text-rose-600">
              The brand was <span className="font-black">{answer}</span>.
            </p>
          )}
          <p className="mt-1 text-neutral-500">Come back tomorrow for a new brand.</p>
        </div>
      )}
    </div>
  );
}
