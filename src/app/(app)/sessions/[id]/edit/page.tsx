import Link from "next/link";
import { notFound } from "next/navigation";
import { today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { SessionForm } from "./session-form";

export const metadata = { title: "Edit reading session · Logabook" };

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Row Level Security returns nothing for someone else's session, so it shows as not found
  const [{ data: session }, { data: books }, { count: noteCount }] = await Promise.all([
    supabase.from("reading_sessions").select("id, book_id, session_date, start_page, end_page").eq("id", id).maybeSingle(),
    supabase.from("books").select("id, title, author, total_pages").order("title"),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("session_id", id),
  ]);
  if (!session) notFound();

  return (
    <>
      <Link href={`/books/${session.book_id}`} className="text-sm text-ink-muted hover:text-ink">
        ← Back to the book
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Edit reading session</h1>
      <p className="mt-1 text-sm text-ink-muted">Fix the book, the date or the pages. Your calendar, streak and stats update to match.</p>
      <SessionForm
        session={session}
        books={(books ?? []).map((b) => ({ id: b.id, title: b.title, author: b.author, totalPages: b.total_pages }))}
        today={today()}
        noteCount={noteCount ?? 0}
      />
    </>
  );
}
