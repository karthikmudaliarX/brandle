import { Game } from "./components/Game";

export default function Home() {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-between gap-6 pb-5">
      <Game />
      <footer className="px-4 text-center text-xs font-medium text-neutral-400 dark:text-neutral-600">
        Made with {"<3"} by karthik
      </footer>
    </main>
  );
}
