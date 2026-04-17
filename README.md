# Brandle

A Wordle-style daily puzzle where the answer is a brand name. The length changes every day — today's brand might be 4 letters, tomorrow's 8 — so the grid resizes with the puzzle. The category is shown as a hint.

Built with Next.js 16, React 19, and Tailwind CSS 4.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

- One puzzle per UTC day, picked deterministically from a curated brand list (`app/lib/brands.ts`).
- 6 guesses. Standard Wordle feedback: green = right letter & spot, amber = right letter wrong spot, gray = not in word.
- Guesses must be brand names from the list (no random words).

## Roadmap

- Share-your-result string after winning/losing
- Stats and streak persistence in localStorage
- Per-category modes (tech only, automotive only, etc.)
- Brand logos on the win screen
