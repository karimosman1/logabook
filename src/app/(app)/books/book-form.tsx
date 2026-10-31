"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { BookCover } from "@/components/book-cover";
import type { BookSuggestion } from "@/lib/openlibrary";
import { lookupBooks, type BookFormState } from "./actions";

type BookFields = {
  title: string;
  author: string;
  publication_year: string;
  genre: string;
  total_pages: string;
  cover_url: string;
  isbn: string;
  status: string;
};

type Props = {
  action: (prev: BookFormState, formData: FormData) => Promise<BookFormState>;
  initial?: Partial<BookFields>;
  submitLabel: string;
  cancelHref: string;
  showSearch?: boolean;
};

const EMPTY: BookFields = {
  title: "",
  author: "",
  publication_year: "",
  genre: "",
  total_pages: "",
  cover_url: "",
  isbn: "",
  status: "reading",
};

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function BookForm({ action, initial, submitLabel, cancelHref, showSearch = false }: Props) {
  const [state, formAction, saving] = useActionState(action, {});
  // Controlled fields so picking a search result can fill them in, and React's form reset can't wipe them
  const [fields, setFields] = useState<BookFields>({ ...EMPTY, ...initial });
  const set = (name: keyof BookFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [name]: e.target.value }));

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSuggestion[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();

  function runSearch() {
    startSearch(async () => {
      const { results, error } = await lookupBooks(query);
      setResults(results ?? null);
      setSearchError(error ?? null);
    });
  }

  function pick(book: BookSuggestion) {
    setFields((f) => ({
      ...f,
      title: book.title,
      author: book.author ?? "",
      publication_year: book.publication_year?.toString() ?? "",
      genre: book.genre ?? "",
      total_pages: book.total_pages?.toString() ?? "",
      cover_url: book.cover_url ?? "",
      isbn: book.isbn ?? "",
    }));
    setResults(null);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_200px]">
      <div className="space-y-6">
        {showSearch && (
          <section className="rounded-xl border border-line bg-paper-raised p-5">
            <h2 className="font-serif text-lg text-ink">Find it on Open Library</h2>
            <div className="mt-3 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearch();
                  }
                }}
                placeholder="Title or author, e.g. Dune"
                className={inputClass}
              />
              <button
                type="button"
                onClick={runSearch}
                disabled={searching}
                className="rounded-md border border-line px-4 text-sm text-ink hover:bg-paper disabled:opacity-60"
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </div>
            {searchError && <p className="mt-3 text-sm text-red-700">{searchError}</p>}
            {results && results.length === 0 && (
              <p className="mt-3 text-sm text-ink-muted">No matches. Try another search, or fill in the details below.</p>
            )}
            {results && results.length > 0 && (
              <ul className="mt-3 divide-y divide-line">
                {results.map((book) => (
                  <li key={book.key}>
                    <button
                      type="button"
                      onClick={() => pick(book)}
                      className="flex w-full items-center gap-3 py-2 text-left hover:bg-paper"
                    >
                      <div className="w-10 shrink-0">
                        <BookCover title={book.title} coverUrl={book.cover_url} className="text-[6px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{book.title}</p>
                        <p className="truncate text-sm text-ink-muted">
                          {[book.author, book.publication_year].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <form action={formAction} className="space-y-4" noValidate>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Title</span>
            <input name="title" value={fields.title} onChange={set("title")} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Author</span>
            <input name="author" value={fields.author} onChange={set("author")} className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="mb-1 block text-ink">Year published</span>
              <input
                name="publication_year"
                type="number"
                value={fields.publication_year}
                onChange={set("publication_year")}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink">Total pages</span>
              <input
                name="total_pages"
                type="number"
                value={fields.total_pages}
                onChange={set("total_pages")}
                className={inputClass}
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Genre</span>
            <input name="genre" value={fields.genre} onChange={set("genre")} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Status</span>
            <select name="status" value={fields.status} onChange={set("status")} className={inputClass}>
              <option value="reading">Reading</option>
              <option value="want_to_read">Want to read</option>
              <option value="finished">Finished</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink">Cover image link</span>
            <input name="cover_url" value={fields.cover_url} onChange={set("cover_url")} className={inputClass} />
          </label>
          <input type="hidden" name="isbn" value={fields.isbn} />

          {state.error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : submitLabel}
            </button>
            <Link href={cancelHref} className="text-sm text-ink-muted hover:text-ink">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <aside className="hidden md:block">
        <BookCover title={fields.title || "Your book"} coverUrl={fields.cover_url || null} />
      </aside>
    </div>
  );
}
