"use client";

import { useState, useTransition } from "react";
import { deleteBook } from "../actions";

export function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Confirm delete" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
      <p className="text-red-800">
        Are you sure you want to delete <strong>{title}</strong>? Its reading sessions and notes will be deleted too.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={deleting}
          onClick={() => startDelete(() => deleteBook(id))}
          className="rounded-md bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
