import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { StarButton } from "@/components/star-button";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Library · Logabook" };

const STATUS_LABEL: Record<string, string> = {
  reading: "Reading",
  finished: "Finished",
  want_to_read: "Want to read",
};

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const starredOnly = view === "starred";

  const supabase = await createClient();
  const [{ data: allBooks }, { data: stars }] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, author, publication_year, cover_url, status, last_read_at")
      .order("last_read_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase.from("stars").select("book_id"),
  ]);

  const starredIds = new Set((stars ?? []).map((s) => s.book_id));
  const books = starredOnly ? (allBooks ?? []).filter((b) => starredIds.has(b.id)) : allBooks;

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm ${active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"}`;

  return (
    <>
      <h1 className="font-serif text-3xl text-ink">Your library</h1>
      <p className="mt-1 text-sm text-ink-muted">Most recently read first.</p>

      <nav className="mt-6 flex gap-2" aria-label="Library views">
        <Link href="/books" className={tab(!starredOnly)} aria-current={!starredOnly ? "page" : undefined}>
          All books
        </Link>
        <Link href="/books?view=starred" className={tab(starredOnly)} aria-current={starredOnly ? "page" : undefined}>
          ★ Starred
        </Link>
      </nav>

      {starredOnly && !books?.length ? (
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
