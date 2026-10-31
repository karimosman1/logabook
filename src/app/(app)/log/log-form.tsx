"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { FieldError, invalidClass } from "@/components/field-error";
import { logSession } from "./actions";

type BookOption = {
  id: string;
  title: string;
  author: string | null;
  totalPages: number | null;
  currentPage: number;
};

type Props = { books: BookOption[]; preselected?: string };

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

// Today's date in the reader's own timezone, as YYYY-MM-DD
function localToday() {
  return new Date().toLocaleDateString("en-CA");
}

export function LogForm({ books, preselected }: Props) {
  const [state, formAction, saving] = useActionState(logSession, {});
  const errors = state.fieldErrors ?? {};

  const initialBook = books.find((b) => b.id === preselected) ?? books[0];
  const [bookId, setBookId] = useState(initialBook?.id ?? "");
  const [date, setDate] = useState("");
  const [startPage, setStartPage] = useState(initialBook ? String(initialBook.currentPage + 1) : "");
  const [endPage, setEndPage] = useState("");
  const [quotes, setQuotes] = useState<{ content: string; page: string }[]>([]);
  const [notes, setNotes] = useState<string[]>([""]);

  // Set the date after the page loads so it uses the reader's clock, not the server's
  useEffect(() => setDate(localToday()), []);

  const book = books.find((b) => b.id === bookId);

  function chooseBook(id: string) {
    setBookId(id);
    const next = books.find((b) => b.id === id);
    setStartPage(next ? String(next.currentPage + 1) : "");
  }

  if (!books.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line p-10 text-center">
        <p className="text-ink">Add a book to your library first, then log your reading here.</p>
        <Link href="/books/new" className="mt-3 inline-block text-accent underline">
          Add a book
        </Link>
      </div>
    );
  }

  const pages = Number(endPage) - Number(startPage) + 1;
  const pastLastPage = !!book?.totalPages && Number(endPage) > book.totalPages;

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-6" noValidate>
      <section className="space-y-4 rounded-xl border border-line bg-paper-raised p-5">
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Book</span>
          <select
            name="book_id"
            value={bookId}
            onChange={(e) => chooseBook(e.target.value)}
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
          <span className="mt-1 block text-ink-muted">
            Started a new book?{" "}
            <Link href="/books/new" className="text-accent underline">
              Add it to your library
            </Link>{" "}
            first.
          </span>
        </label>

        <div className="grid grid-cols-3 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Date</span>
            <input
              name="session_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
        <p className="text-sm text-ink-muted">
          {book && `You were on page ${book.currentPage}${book.totalPages ? ` of ${book.totalPages}` : ""}. `}
          {startPage && endPage && pages > 0 && !pastLastPage && (
            <span className="text-accent">
              That&apos;s {pages} page{pages === 1 ? "" : "s"}
              {pages >= 10 ? ". Goal hit!" : "."}
            </span>
          )}
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-line bg-paper-raised p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Quotes you highlighted</h2>
          <button
            type="button"
            onClick={() => setQuotes((q) => [...q, { content: "", page: "" }])}
            className="text-sm text-accent underline"
          >
            + Add a quote
          </button>
        </div>
        {quotes.length === 0 && <p className="text-sm text-ink-muted">No quotes this time.</p>}
        {quotes.map((quote, i) => (
          <div key={i} className="flex gap-2">
            <textarea
              name="quote_content"
              rows={2}
              placeholder="Type the quote"
              value={quote.content}
              onChange={(e) => setQuotes((q) => q.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))}
              className={inputClass}
            />
            <input
              name="quote_page"
              type="number"
              placeholder="Page"
              value={quote.page}
              onChange={(e) => setQuotes((q) => q.map((x, j) => (j === i ? { ...x, page: e.target.value } : x)))}
              className={`${inputClass} w-24`}
            />
            <button
              type="button"
              aria-label="Remove quote"
              onClick={() => setQuotes((q) => q.filter((_, j) => j !== i))}
              className="px-2 text-ink-muted hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-xl border border-line bg-paper-raised p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Notes</h2>
          <button type="button" onClick={() => setNotes((n) => [...n, ""])} className="text-sm text-accent underline">
            + Add another note
          </button>
        </div>
        {notes.map((note, i) => (
          <div key={i} className="flex gap-2">
            <textarea
              name="note_content"
              rows={3}
              placeholder="Thoughts, questions, things to remember…"
              value={note}
              onChange={(e) => setNotes((n) => n.map((x, j) => (j === i ? e.target.value : x)))}
              className={inputClass}
            />
            {notes.length > 1 && (
              <button
                type="button"
                aria-label="Remove note"
                onClick={() => setNotes((n) => n.filter((_, j) => j !== i))}
                className="px-2 text-ink-muted hover:text-red-700"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </section>

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-accent px-5 py-2 font-medium text-white hover:bg-accent/90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save reading session"}
      </button>
    </form>
  );
}
