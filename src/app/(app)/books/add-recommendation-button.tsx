"use client";

import { useState, useTransition } from "react";
import type { BookSuggestion } from "@/lib/openlibrary";
import { addToWantToRead } from "./actions";

export function AddRecommendationButton({ book }: { book: BookSuggestion }) {
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const [pending, startTransition] = useTransition();

  if (state === "added") return <p className="mt-2 text-sm text-accent">Added to Want to read ✓</p>;

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const { error } = await addToWantToRead(book);
            setState(error ? "error" : "added");
          })
        }
        className="mt-2 rounded-md border border-line px-2.5 py-1 text-sm text-ink hover:bg-paper disabled:opacity-60"
      >
        {pending ? "Adding…" : "+ Want to read"}
      </button>
      {state === "error" && <p className="mt-1 text-xs text-red-700">Couldn&apos;t add it. Try again.</p>}
    </>
  );
}
