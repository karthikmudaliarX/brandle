# Brandle — Practice Mode Spec

## What to build

After the daily puzzle ends (win or lose), the player can hit "Play Again" to start
an unlimited practice session. Each practice round picks a random brand. Practice is
ephemeral — no stats, no localStorage writes, no share button. A "← Today's puzzle"
link returns to the daily game.

---

## Files to read before touching anything

- app/components/Game.tsx      — all game state lives here
- app/components/Grid.tsx      — renders the 6-row guess grid
- app/components/Keyboard.tsx  — on-screen keyboard
- app/components/Stats.tsx     — stats distribution panel (shown in EndPanel)
- app/lib/game.ts              — getDailyBrand(), isValidGuess(), evaluateGuess()
- app/lib/brands.ts            — PUZZLE_BRANDS array, Brand type
- app/lib/stats.ts             — loadProgress(), saveProgress(), recordGame()
- app/lib/share.ts             — buildShareString(), getPuzzleNumber()

---

## Change 1 — app/lib/game.ts

Add one function after the existing exports:

```ts
// Pick a random brand excluding `exclude` (today's daily answer).
// Practice rounds use Math.random() — no need for determinism.
export function getRandomBrand(exclude: string): Brand {
  const pool = PUZZLE_BRANDS.filter((b) => b.name !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}
```

---

## Change 2 — app/components/Game.tsx

### 2a. New import
Add `getRandomBrand` to the import from `../lib/game`.

### 2b. New state
Add two pieces of state inside the `Game` function, after the existing state declarations:

```ts
const [mode, setMode] = useState<"daily" | "practice">("daily");
const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
```

### 2c. Derived values
Replace the two lines:
```ts
const answer = brand.name;
const length = answer.length;
```
with:
```ts
const answer = mode === "practice" && practiceAnswer ? practiceAnswer : brand.name;
// Look up the practice brand object so we can show its category.
const practiceBrand =
  mode === "practice" && practiceAnswer
    ? (PUZZLE_BRANDS.find((b) => b.name === practiceAnswer) ?? brand)
    : null;
const activeBrand = practiceBrand ?? brand;
const length = answer.length;
```

Add this import at the top of the file (or inside the existing brands import):
```ts
import { PUZZLE_BRANDS } from "../lib/brands";
```

### 2d. Guard localStorage writes with mode check
In the progress-persist useEffect:
```ts
useEffect(() => {
  if (!hydrated) return;
  if (mode !== "daily") return;   // ← add this line
  saveProgress({ puzzleNumber, guesses, status });
}, [hydrated, puzzleNumber, guesses, status, mode]);
```

In the stats-record useEffect:
```ts
useEffect(() => {
  if (!hydrated) return;
  if (status === "playing") return;
  if (mode !== "daily") return;   // ← add this line
  if (recordedRef.current) return;
  ...
}, [hydrated, status, puzzleNumber, guesses.length, mode]);
```

### 2e. playAgain function
Add this function inside the `Game` component, after `handleKey`:

```ts
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
```

### 2f. Header — show PRACTICE badge
Replace:
```tsx
<h1 className="text-3xl font-black tracking-tight">BRANDLE</h1>
```
with:
```tsx
<h1 className="text-3xl font-black tracking-tight">
  BRANDLE
  {mode === "practice" && (
    <span className="ml-2 align-middle text-xs font-semibold tracking-widest text-amber-500 uppercase">
      Practice
    </span>
  )}
</h1>
```

### 2g. Pass new props to EndPanel
Replace the `<EndPanel ... />` call to include the new handlers and mode:

```tsx
<EndPanel
  status={status}
  guesses={guesses}
  answer={answer}
  stats={stats}
  mode={mode}
  onShare={async () => {
    const text = buildShareString(guesses, answer, status === "won");
    const ok = await copyToClipboard(text);
    showToast(ok ? "Copied to clipboard" : "Couldn't copy");
  }}
  onPlayAgain={playAgain}
  onReturnToDaily={returnToDaily}
/>
```

Also update the header subtitle to use `activeBrand` instead of `brand`:
```tsx
<p className="text-sm text-neutral-500 dark:text-neutral-400">
  Today&apos;s brand has{" "}
  ...
  · category:{" "}
  <span ...>{activeBrand.category}</span>
```

---

## Change 3 — EndPanel (inside Game.tsx)

### 3a. Update the type
```ts
type EndPanelProps = {
  status: "won" | "lost";
  guesses: string[];
  answer: string;
  stats: Stats;
  mode: "daily" | "practice";
  onShare: () => void;
  onPlayAgain: () => void;
  onReturnToDaily: () => void;
};
```

### 3b. Update the component signature
```ts
function EndPanel({ status, guesses, answer, stats, mode, onShare, onPlayAgain, onReturnToDaily }: EndPanelProps) {
```

### 3c. Replace the button section
Keep the result text and StatsPanel. Replace the bottom buttons block:

```tsx
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
      className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 active:scale-95"
    >
      Share result
    </button>
  )}
  {mode === "practice" && (
    <button
      type="button"
      onClick={onReturnToDaily}
      className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 active:scale-95"
    >
      ← Today&apos;s puzzle
    </button>
  )}
</div>
```

Also: hide the puzzle number line in practice mode:
```tsx
{mode === "daily" && (
  <p className="text-xs text-neutral-500">
    Brandle #{num} · {answer.length} letters · come back tomorrow.
  </p>
)}
{mode === "practice" && (
  <p className="text-xs text-neutral-500">
    Practice mode · {answer.length} letters · stats not counted
  </p>
)}
```

---

## Verification

After all changes, run:
```bash
cd /home/karthik/Projects/brandle
npm run build
```

Must compile with zero TypeScript errors.

Then commit:
```bash
git add -A
git commit -m "feat: add practice mode (play again after daily puzzle)"
```

Do NOT push. The planner will review and push.

---

## Edge cases to handle

1. `getRandomBrand` called when `PUZZLE_BRANDS` has only one entry — impossible with 74
   brands but the filter could theoretically return empty if exclude matches all. Add:
   `if (pool.length === 0) return PUZZLE_BRANDS[0];`

2. Returning to daily while status is already "won"/"lost" from today — the `returnToDaily`
   function restores the saved progress including status, so the EndPanel re-appears.
   That is correct behaviour.

3. `recordedRef` — when returning from practice to daily, if the daily was already
   completed and recorded, `recordedRef.current` is still `true`, so no double-counting.
   Correct.

4. Physical keyboard listener does not need changes — it delegates to `handleKey`
   which checks `status !== "playing"` before doing anything.
