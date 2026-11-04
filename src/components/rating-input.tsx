"use client";

import { useOptimistic, useTransition } from "react";
import { setRating } from "@/app/(app)/books/actions";

type Props = { bookId: string; title: string; rating: number | null };

// Five stars to rate a book. Clicking the current rating again clears it.
export function RatingInput({ bookId, title, rating }: Props) {
  const [optimisticRating, setOptimisticRating] = useOptimistic(rating);
  const [, startTransition] = useTransition();

  function choose(value: number) {
    const next = value === optimisticRating ? null : value;
    startTransition(async () => {
      setOptimisticRating(next);
      await setRating(bookId, next);
    });
  }

  return (
    <div role="group" aria-label={`Your rating for ${title}`} className="flex items-center gap-2">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={optimisticRating === value}
            aria-label={`${value} out of 5`}
            title={optimisticRating === value ? "Click again to clear your rating" : `Rate ${value} out of 5`}
            className={`px-0.5 text-2xl leading-none transition hover:scale-110 ${
              optimisticRating && value <= optimisticRating ? "text-partial" : "text-line"
            }`}
          >
            ★
          </button>
        ))}
      </span>
      <span className="text-sm text-ink-muted">{optimisticRating ? `${optimisticRating}/5` : "Not rated yet"}</span>
    </div>
  );
}

// A read-only rating, for the library grid
export function RatingStars({ rating }: { rating: number }) {
  return (
    <span aria-label={`Rated ${rating} out of 5`} className="text-sm tracking-tight">
      <span className="text-partial">{"★".repeat(rating)}</span>
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
