"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { hasErrors, validateSession, type FieldErrors } from "@/lib/validation";

export type SessionFormState = { error?: string; fieldErrors?: FieldErrors };

type Supabase = Awaited<ReturnType<typeof createClient>>;

function toNumber(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  const n = Number(s);
  return s === "" || Number.isNaN(n) ? null : n;
}

// After a session changes, work out the book's "last read" date and status again from the
// sessions it has left, so the library order and the Finished label stay right.
async function refreshBook(supabase: Supabase, bookId: string) {
  const [{ data: book }, { data: sessions }] = await Promise.all([
    supabase.from("books").select("total_pages, status").eq("id", bookId).maybeSingle(),
    supabase.from("reading_sessions").select("session_date, end_page").eq("book_id", bookId),
  ]);
  if (!book) return;

  const lastReadAt = (sessions ?? []).reduce<string | null>((latest, s) => (!latest || s.session_date > latest ? s.session_date : latest), null);
  const furthest = Math.max(0, ...(sessions ?? []).map((s) => s.end_page ?? 0));

  let status = book.status;
  if (book.total_pages != null && furthest >= book.total_pages) status = "finished";
  else if (status === "finished" || (status === "want_to_read" && sessions?.length)) status = "reading";

  await supabase.from("books").update({ last_read_at: lastReadAt, status }).eq("id", bookId);
}

export async function updateSession(id: string, _prev: SessionFormState, formData: FormData): Promise<SessionFormState> {
  const bookId = String(formData.get("book_id") ?? "");
  const sessionDate = String(formData.get("session_date") ?? "");
  const startPage = toNumber(formData.get("start_page"));
  const endPage = toNumber(formData.get("end_page"));

  const supabase = await createClient();
  const [{ data: original }, { data: book }] = await Promise.all([
    supabase.from("reading_sessions").select("book_id, session_date").eq("id", id).maybeSingle(),
    bookId ? supabase.from("books").select("total_pages").eq("id", bookId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!original) return { error: "That reading session doesn't exist any more." };

  const fieldErrors = validateSession(
    { bookId: book ? bookId : "", sessionDate, startPage, endPage, totalPages: book?.total_pages ?? null },
    today(),
    original.session_date,
  );
  if (hasErrors(fieldErrors)) return { error: "Please fix the highlighted fields.", fieldErrors };

  const { error } = await supabase
    .from("reading_sessions")
    .update({
      book_id: bookId,
      session_date: sessionDate,
      start_page: startPage,
      end_page: endPage,
      pages_read: endPage! - startPage! + 1, // pages 1 to 12 is 12 pages, so count both ends
    })
    .eq("id", id);
  if (error) return { error: "Couldn't save your changes. Please try again." };

  // Moved to another book: its quotes and notes move with it
  if (bookId !== original.book_id) {
    await supabase.from("notes").update({ book_id: bookId }).eq("session_id", id);
    await refreshBook(supabase, original.book_id);
    revalidatePath(`/books/${original.book_id}`);
  }
  await refreshBook(supabase, bookId);

  revalidatePath("/", "layout");
  redirect(`/books/${bookId}`);
}

export async function deleteSession(id: string) {
  const supabase = await createClient();
  const { data: session } = await supabase.from("reading_sessions").select("book_id").eq("id", id).maybeSingle();
  if (!session) redirect("/books");

  // Its quotes and notes are deleted with it (on delete cascade)
  await supabase.from("reading_sessions").delete().eq("id", id);
  await refreshBook(supabase, session.book_id);

  revalidatePath("/", "layout");
  redirect(`/books/${session.book_id}`);
}
