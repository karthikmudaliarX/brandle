import type { Metadata } from "next";
import Link from "next/link";
import { Tile } from "../components/Tile";
import type { TileState } from "../lib/game";

export const metadata: Metadata = {
  title: "How to Play Brandle",
  description: "Learn the rules for Brandle, the daily brand-name word puzzle.",
};

const examples: { letter: string; state: TileState; label: string; detail: string }[] = [
  {
    letter: "A",
    state: "correct",
    label: "Green",
    detail: "The letter is in the brand and in the right spot.",
  },
  {
    letter: "E",
    state: "present",
    label: "Amber",
    detail: "The letter is in the brand, but somewhere else.",
  },
  {
    letter: "X",
    state: "absent",
    label: "Gray",
    detail: "The letter is not in the brand.",
  },
];

const steps = [
  "Use the letter count and category as your hints.",
  "Type any alphabetic guess with the right number of letters.",
  "Solve the brand in six guesses or fewer.",
  "After the daily puzzle, play practice rounds without affecting your stats.",
];

function MiniRow() {
  const letters = "BRAND".split("");
  const states: TileState[] = ["correct", "present", "absent", "absent", "correct"];

  return (
    <div
      className="grid w-full max-w-52 gap-1.5"
      style={{ gridTemplateColumns: `repeat(${letters.length}, minmax(0, 1fr))` }}
      aria-label="Example Brandle guess feedback"
    >
      {letters.map((letter, index) => (
        <Tile key={`${letter}-${index}`} letter={letter} state={states[index]} />
      ))}
    </div>
  );
}

export default function HowToPlayPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-5 py-8 text-neutral-950 dark:text-neutral-50">
      <nav className="mb-10">
        <Link
          href="/"
          className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          Back to puzzle
        </Link>
      </nav>

      <header className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Brandle basics
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">How to play</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
          Guess the hidden brand name. Every puzzle gives you the brand&apos;s
          length and category before you start.
        </p>
      </header>

      <section className="border-y border-neutral-200 py-8 dark:border-neutral-800">
        <div className="mb-6 flex justify-center">
          <MiniRow />
        </div>
        <ol className="grid gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-8">
        <h2 className="text-lg font-black tracking-tight">Tile colors</h2>
        <div className="mt-5 grid gap-5">
          {examples.map((example) => (
            <div key={example.state} className="grid grid-cols-[3rem_1fr] items-center gap-4">
              <Tile letter={example.letter} state={example.state} />
              <div>
                <h3 className="text-sm font-bold">{example.label}</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {example.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-auto border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95"
        >
          Start playing
        </Link>
      </div>
    </main>
  );
}
