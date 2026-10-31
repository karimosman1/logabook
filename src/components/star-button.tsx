"use client";

import { useOptimistic, useTransition } from "react";
import { setStarred } from "@/app/(app)/books/actions";

type Props = { bookId: string; title: string; starred: boolean; className?: string };

export function StarButton({ bookId, title, starred, className = "" }: Props) {
  // Flip the star straight away; the server action catches up in the background
  const [optimisticStarred, setOptimisticStarred] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setOptimisticStarred(!optimisticStarred);
      await setStarred(bookId, !optimisticStarred);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimisticStarred}
      aria-label={optimisticStarred ? `Unstar ${title}` : `Star ${title}`}
      title={optimisticStarred ? "Starred" : "Star this book"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm transition hover:scale-110 ${
        optimisticStarred ? "text-partial" : "text-ink-muted"
      } ${className}`}
    >
      {optimisticStarred ? "★" : "☆"}
    </button>
  );
}
