import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-black tracking-tight">404</h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Back to Brandle
      </Link>
    </main>
  );
}
