import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/book-cover";
import { StarButton } from "@/components/star-button";
import { createClient } from "@/lib/supabase/server";
import { DeleteBookButton } from "./delete-button";

const STATUS_LABEL: Record<string, string> = {
  reading: "Reading",
  finished: "Finished",
  want_to_read: "Want to read",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase.from("books").select("title").eq("id", id).maybeSingle();
  return { title: book ? `${book.title} · Logabook` : "Logabook" };
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Row Level Security returns nothing for someone else's book, so it shows as not found
  const { data: book } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (!book) notFound();

  const [{ data: sessions }, { data: notes }, { data: star }] = await Promise.all([
    supabase
      .from("reading_sessions")
      .select("id, session_date, start_page, end_page, pages_read")
      .eq("book_id", id)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("id, kind, content, page_number, created_at")
      .eq("book_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("stars").select("book_id").eq("book_id", id).maybeSingle(),
  ]);

  const currentPage = Math.max(0, ...(sessions ?? []).map((s) => s.end_page ?? 0));
  const progress = book.total_pages ? Math.min(100, Math.round((currentPage / book.total_pages) * 100)) : null;

  return (
    <>
      <Link href="/books" className="text-sm text-ink-muted hover:text-ink">
        ← Library
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="mx-auto w-44 md:w-full">
          <BookCover title={book.title} coverUrl={book.cover_url} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-accent">{STATUS_LABEL[book.status]}</p>
          <div className="mt-1 flex items-start gap-3">
            <h1 className="font-serif text-4xl text-ink">{book.title}</h1>
            <StarButton bookId={book.id} title={book.title} starred={!!star} className="mt-1 shrink-0 border border-line" />
          </div>
          {book.author && <p className="mt-1 text-lg text-ink-muted">{book.author}</p>}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink-muted">Published</dt>
              <dd className="text-ink">{book.publication_year ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Genre</dt>
              <dd className="text-ink">{book.genre ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Pages</dt>
              <dd className="text-ink">{book.total_pages ?? "—"}</dd>
            </div>
          </dl>

          <section className="mt-6 rounded-xl border border-line bg-paper-raised p-5">
            <p className="text-sm text-ink-muted">You&apos;re on</p>
            <p className="font-serif text-3xl text-ink">
              Page {currentPage}
              {book.total_pages ? <span className="text-lg text-ink-muted"> of {book.total_pages}</span> : null}
            </p>
            {progress !== null && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
              </div>
            )}
          </section>

          <div className="mt-6 flex items-start gap-3">
            <Link
              href={`/log?book=${book.id}`}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              Log reading
            </Link>
            <Link
              href={`/books/${book.id}/edit`}
              className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper-raised"
            >
              Edit
            </Link>
            <DeleteBookButton id={book.id} title={book.title} />
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-ink">Reading log</h2>
        {!sessions?.length ? (
          <p className="mt-2 text-sm text-ink-muted">No reading sessions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-paper-raised">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink">{s.session_date}</span>
                <span className="text-ink-muted">
                  {s.start_page != null && s.end_page != null ? `Pages ${s.start_page}–${s.end_page}` : "Pages not recorded"}
                </span>
                <span className={s.pages_read != null && s.pages_read >= 10 ? "text-accent" : "text-ink-muted"}>
                  {s.pages_read ?? "—"} pages
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-ink">Notes &amp; quotes</h2>
        {!notes?.length ? (
          <p className="mt-2 text-sm text-ink-muted">Nothing yet. Notes and quotes from your reading sessions will show up here.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-line bg-paper-raised p-4">
                {note.kind === "quote" ? (
                  <blockquote className="font-serif text-lg italic text-ink">“{note.content}”</blockquote>
                ) : (
                  <p className="text-ink">{note.content}</p>
                )}
                <p className="mt-2 text-xs text-ink-muted">
                  {note.kind === "quote" ? "Quote" : "Note"}
                  {note.page_number ? ` · p. ${note.page_number}` : ""} · {note.created_at}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
