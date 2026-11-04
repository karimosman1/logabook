"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { FieldError, invalidClass } from "@/components/field-error";
import { earliestLogDate } from "@/lib/dates";
import { deleteSession, updateSession } from "../../actions";

type Props = {
  session: { id: string; book_id: string; session_date: string; start_page: number | null; end_page: number | null };
  books: { id: string; title: string; author: string | null; totalPages: number | null }[];
  today: string;
  noteCount: number;
};

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function SessionForm({ session, books, today, noteCount }: Props) {
  const [state, formAction, saving] = useActionState(updateSession.bind(null, session.id), {});
  const errors = state.fieldErrors ?? {};
  const [startPage, setStartPage] = useState(String(session.start_page ?? ""));
  const [endPage, setEndPage] = useState(String(session.end_page ?? ""));
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();

  // An older session can keep its own date, even if it's outside the 7-day window
  const earliest = [earliestLogDate(today), session.session_date].sort()[0];
  const pages = Number(endPage) - Number(startPage) + 1;

  return (
    <>
      <form action={formAction} className="mt-6 max-w-2xl space-y-6" noValidate>
        <section className="space-y-4 rounded-xl border border-line bg-paper-raised p-5">
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Book</span>
            <select
              name="book_id"
              defaultValue={session.book_id}
              aria-invalid={!!errors.book_id}
              className={inputClass + invalidClass(errors.book_id)}
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                  {b.author ? ` — ${b.author}` : ""}
                </option>
              ))}
            </select>
            <FieldError message={errors.book_id} />
          </label>

          <div className="grid grid-cols-3 gap-4">
            <label className="block text-sm">
              <span className="mb-1 block text-ink">Date</span>
              <input
                name="session_date"
                type="date"
                min={earliest}
                max={today}
                defaultValue={session.session_date}
                aria-invalid={!!errors.session_date}
                className={inputClass + invalidClass(errors.session_date)}
              />
              <FieldError message={errors.session_date} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink">From page</span>
              <input
                name="start_page"
                type="number"
                min={1}
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                aria-invalid={!!errors.start_page}
                className={inputClass + invalidClass(errors.start_page)}
              />
              <FieldError message={errors.start_page} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink">To page</span>
              <input
                name="end_page"
                type="number"
                min={1}
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                aria-invalid={!!errors.end_page}
                className={inputClass + invalidClass(errors.end_page)}
              />
              <FieldError message={errors.end_page} />
            </label>
          </div>
          {startPage && endPage && pages > 0 && (
            <p className="text-sm text-accent">
              That&apos;s {pages} page{pages === 1 ? "" : "s"}
              {pages >= 10 ? ". Goal hit!" : "."}
            </p>
          )}
        </section>

        {state.error && <p className="text-sm text-red-700">{state.error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link href={`/books/${session.book_id}`} className="text-sm text-ink-muted hover:text-ink">
            Cancel
          </Link>
        </div>
      </form>

      <section className="mt-10 max-w-2xl border-t border-line pt-6">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Delete this session
          </button>
        ) : (
          <div role="alertdialog" aria-label="Confirm delete" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
            <p className="text-red-800">
              Are you sure you want to delete this reading session?
              {noteCount > 0 && ` Its ${noteCount} note${noteCount === 1 ? "" : "s"} and quote${noteCount === 1 ? "" : "s"} will be deleted too.`}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => startDelete(() => deleteSession(session.id))}
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
        )}
      </section>
    </>
  );
}
