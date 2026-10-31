import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { StarButton } from "@/components/star-button";
import { createClient } from "@/lib/supabase/server";
import { LibraryFilters } from "./library-filters";

export const metadata = { title: "Library · Logabook" };

const STATUS_LABEL: Record<string, string> = {
  reading: "Reading",
  finished: "Finished",
  want_to_read: "Want to read",
};

const SORT_LABEL: Record<string, string> = {
  recent: "Most recently read first.",
  title: "Sorted by title, A–Z.",
  year: "Newest publications first.",
  added: "Most recently added first.",
};

type SearchParams = { view?: string; q?: string; status?: string; genre?: string; sort?: string };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const starredOnly = params.view === "starred";
  const sort = params.sort && params.sort in SORT_LABEL ? params.sort : "recent";
  // Commas and brackets have meaning in Supabase's filter syntax, so strip them from the search
  const q = (params.q ?? "").replace(/[,()%*\\]/g, " ").trim();
  const filtering = Boolean(q || params.status || params.genre);

  const supabase = await createClient();

  let query = supabase.from("books").select("id, title, author, publication_year, cover_url, status, last_read_at");
  if (q) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  if (params.status) query = query.eq("status", params.status);
  if (params.genre) query = query.eq("genre", params.genre);

  if (sort === "title") query = query.order("title", { ascending: true });
  else if (sort === "year") query = query.order("publication_year", { ascending: false, nullsFirst: false });
  else if (sort === "added") query = query.order("created_at", { ascending: false });
  else query = query.order("last_read_at", { ascending: false, nullsFirst: false });
  query = query.order("created_at", { ascending: false });

  const [{ data: allBooks }, { data: stars }, { data: genreRows }] = await Promise.all([
    query,
    supabase.from("stars").select("book_id"),
    supabase.from("books").select("genre").not("genre", "is", null),
  ]);

  const starredIds = new Set((stars ?? []).map((s) => s.book_id));
  const books = starredOnly ? (allBooks ?? []).filter((b) => starredIds.has(b.id)) : allBooks;
  const genres = [...new Set((genreRows ?? []).map((r) => r.genre!))].sort();

  // Keep search, filters and sort when switching between All and Starred
  const withView = (view?: string) => {
    const next = new URLSearchParams(
      Object.entries({ ...params, view }).filter((e): e is [string, string] => Boolean(e[1])),
    );
    const qs = next.toString();
    return qs ? `/books?${qs}` : "/books";
  };

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm ${active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"}`;

  return (
    <>
      <h1 className="font-serif text-3xl text-ink">Your library</h1>
      <p className="mt-1 text-sm text-ink-muted">{SORT_LABEL[sort]}</p>

      <nav className="mt-6 flex gap-2" aria-label="Library views">
        <Link href={withView()} className={tab(!starredOnly)} aria-current={!starredOnly ? "page" : undefined}>
          All books
        </Link>
        <Link href={withView("starred")} className={tab(starredOnly)} aria-current={starredOnly ? "page" : undefined}>
          ★ Starred
        </Link>
      </nav>

      <LibraryFilters genres={genres} />

      {filtering && !books?.length ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-10 text-center">
          <p className="text-ink">No books match those filters.</p>
          <Link href={starredOnly ? "/books?view=starred" : "/books"} className="mt-3 inline-block text-accent underline">
            Clear search and filters
          </Link>
        </div>
      ) : starredOnly && !books?.length ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-10 text-center">
          <p className="text-ink">No starred books yet.</p>
          <p className="mt-1 text-sm text-ink-muted">Tap the ☆ on a book you loved to keep it here.</p>
        </div>
      ) : !books?.length ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-10 text-center">
          <p className="text-ink">Your shelf is empty.</p>
          <Link href="/books/new" className="mt-3 inline-block text-accent underline">
            Add your first book
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <li key={book.id} className="relative">
              <StarButton
                bookId={book.id}
                title={book.title}
                starred={starredIds.has(book.id)}
                className="absolute right-2 top-2 z-10"
              />
              <Link href={`/books/${book.id}`} className="group block">
                <BookCover
                  title={book.title}
                  coverUrl={book.cover_url}
                  className="transition group-hover:-translate-y-1 group-hover:shadow-md"
                />
                <p className="mt-2 line-clamp-2 font-serif text-ink">{book.title}</p>
                <p className="text-sm text-ink-muted">
                  {[book.author, book.publication_year].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-accent">{STATUS_LABEL[book.status]}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
