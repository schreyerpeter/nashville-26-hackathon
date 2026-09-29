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
      className={`flex w-12 shrink-0 cursor-pointer flex-col items-center rounded-large border py-sp-0.75 text-scale-3 font-semibold tabular-nums transition-colors ${
        optimistic.voted
          ? "border-coastal-blue-50 bg-coastal-blue-50 text-white hover:border-coastal-blue-60 hover:bg-coastal-blue-60"
          : "border-coastal-blue-40 bg-coastal-blue-10 text-coastal-blue-50 hover:bg-coastal-blue-20"
      }`}
    >
      <span aria-hidden className="text-scale-2">
        ▲
      </span>
      {optimistic.count}
    </button>
  );
}
