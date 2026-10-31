import { createClient } from "@/lib/supabase/server";
import { LogForm } from "./log-form";

export const metadata = { title: "Log reading · Logabook" };

export default async function LogPage({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
  const { book: preselected } = await searchParams;
  const supabase = await createClient();

  const [{ data: books }, { data: sessions }] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, author, total_pages, status")
      .order("last_read_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase.from("reading_sessions").select("book_id, end_page"),
  ]);

  // Current page per book = the furthest page reached in any session
  const currentPage: Record<string, number> = {};
  for (const s of sessions ?? []) {
    currentPage[s.book_id] = Math.max(currentPage[s.book_id] ?? 0, s.end_page ?? 0);
  }

  const options = (books ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    totalPages: b.total_pages,
    currentPage: currentPage[b.id] ?? 0,
  }));

  return (
    <>
      <h1 className="font-serif text-3xl text-ink">Log reading</h1>
      <p className="mt-1 text-sm text-ink-muted">Record the pages you read, plus any quotes or notes.</p>
      <LogForm books={options} preselected={preselected} />
    </>
  );
}
