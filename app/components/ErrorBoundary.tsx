"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Refresh the page to try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
