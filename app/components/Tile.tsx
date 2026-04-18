"use client";

import { useEffect, useRef, useState } from "react";
import type { TileState } from "../lib/game";

const STATE_CLASSES: Record<TileState, string> = {
  correct: "bg-emerald-500 border-emerald-500 text-white",
  present: "bg-amber-400 border-amber-400 text-white",
  absent: "bg-neutral-600 border-neutral-600 text-white",
  pending: "bg-transparent border-neutral-400 text-neutral-900 dark:text-neutral-100",
  empty: "bg-transparent border-neutral-300 dark:border-neutral-700",
};

type TileProps = {
  letter: string;
  state: TileState;
  delay?: number;
};

export function Tile({ letter, state, delay = 0 }: TileProps) {
  const revealed = state === "correct" || state === "present" || state === "absent";
  // Start showing color immediately for tiles restored from saved state.
  // Only hide-then-reveal when state transitions to revealed (new guess submitted).
  const [showColor, setShowColor] = useState(revealed);
  const prevState = useRef(state);
  const [popped, setPopped] = useState(false);
  const prevLetter = useRef(letter);
  const displayState = revealed && !showColor ? "pending" : state;

  useEffect(() => {
    if (prevState.current === state) return; // skip on mount — no animation for restored tiles
    prevState.current = state;

    if (!revealed) {
      setShowColor(true);
      return;
    }

    setShowColor(false);
    const id = window.setTimeout(() => setShowColor(true), delay + 200);
    return () => window.clearTimeout(id);
  }, [delay, revealed, state]);

  useEffect(() => {
    if (letter && !prevLetter.current && state === "pending") {
      setPopped(true);
      const id = window.setTimeout(() => setPopped(false), 150);
      return () => window.clearTimeout(id);
    }
    prevLetter.current = letter;
  }, [letter, state]);

  return (
    <div
      className={`flex aspect-square w-full items-center justify-center border-2 text-2xl font-bold uppercase select-none sm:text-3xl ${STATE_CLASSES[displayState]} ${revealed && !showColor ? "tile-flip" : ""}`}
      style={{
        ...(revealed && !showColor && delay > 0 ? { animationDelay: `${delay}ms` } : {}),
        ...(popped ? { animation: "tile-pop 0.15s ease-in-out" } : {}),
      }}
    >
      {letter}
    </div>
  );
}
