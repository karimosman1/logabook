"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasErrors, validateSession, type FieldErrors } from "@/lib/validation";

export type LogFormState = { error?: string; fieldErrors?: FieldErrors };

function toNumber(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  const n = Number(s);
  return s === "" || Number.isNaN(n) ? null : n;
}

export async function logSession(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const bookId = String(formData.get("book_id") ?? "");
  const sessionDate = String(formData.get("session_date") ?? "");
  const startPage = toNumber(formData.get("start_page"));
  const endPage = toNumber(formData.get("end_page"));

  const supabase = await createClient();
  const { data: book } = bookId
    ? await supabase.from("books").select("total_pages, last_read_at").eq("id", bookId).maybeSingle()
    : { data: null };

  const fieldErrors = validateSession(
    { bookId: book ? bookId : "", sessionDate, startPage, endPage, totalPages: book?.total_pages ?? null },
    new Date().toISOString().slice(0, 10),
  );
  if (hasErrors(fieldErrors)) return { error: "Please fix the highlighted fields.", fieldErrors };

  // Pages 1 to 12 is 12 pages, so count both ends
  const pagesRead = endPage! - startPage! + 1;

  const { data: session, error } = await supabase
    .from("reading_sessions")
    .insert({
      book_id: bookId,
      session_date: sessionDate,
      start_page: startPage,
      end_page: endPage,
      pages_read: pagesRead,
    })
    .select("id, session_date")
    .single();
  if (error) return { error: "Couldn't save your reading session. Please try again." };

  // Quotes and notes arrive as parallel lists from the repeating form rows
  const quotes = formData.getAll("quote_content").map((content, i) => ({
    kind: "quote",
    content: String(content).trim(),
    page_number: toNumber(formData.getAll("quote_page")[i] ?? null),
  }));
  const notes = formData.getAll("note_content").map((content) => ({
    kind: "note",
    content: String(content).trim(),
    page_number: null,
  }));
  const rows = [...quotes, ...notes]
    .filter((n) => n.content !== "")
    .map((n) => ({ ...n, book_id: bookId, session_id: session.id }));

  if (rows.length) {
    const { error: notesError } = await supabase.from("notes").insert(rows);
    if (notesError) return { error: "Your pages were saved, but the notes couldn't be. Please add them again." };
  }

  // Keep the library's "last read" order and the book's status up to date
  const finished = book?.total_pages != null && endPage! >= book.total_pages;
  const lastReadAt =
    book?.last_read_at && book.last_read_at > session.session_date ? book.last_read_at : session.session_date;
  await supabase
    .from("books")
    .update({ last_read_at: lastReadAt, status: finished ? "finished" : "reading" })
    .eq("id", bookId);

  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
  redirect(`/books/${bookId}`);
}
