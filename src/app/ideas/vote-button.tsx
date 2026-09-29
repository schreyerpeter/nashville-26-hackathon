"use client";

import { useOptimistic, useTransition } from "react";

import { setVote } from "./actions";

export function VoteButton({ ideaId, count, voted }: { ideaId: string; count: number; voted: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic({ count, voted });
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !optimistic.voted;
    startTransition(async () => {
      setOptimistic({ voted: next, count: optimistic.count + (next ? 1 : -1) });
      await setVote(ideaId, next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimistic.voted}
      aria-label={optimistic.voted ? "Remove your vote" : "Vote for this idea"}
      className={`flex w-12 shrink-0 flex-col items-center rounded-lg border py-1.5 text-sm font-medium tabular-nums transition-colors ${
        optimistic.voted
          ? "border-foreground bg-foreground text-background"
          : "border-black/15 hover:border-black/40 dark:border-white/20 dark:hover:border-white/50"
      }`}
    >
      <span aria-hidden className="text-xs leading-none">
        ▲
      </span>
      {optimistic.count}
    </button>
  );
}
