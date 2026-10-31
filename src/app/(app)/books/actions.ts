"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { searchBooks, type BookSuggestion } from "@/lib/openlibrary";
import { createClient } from "@/lib/supabase/server";
import { hasErrors, validateBook, type FieldErrors } from "@/lib/validation";

export type BookFormState = { error?: string; fieldErrors?: FieldErrors };

const FIX_FIELDS = "Please fix the highlighted fields.";

const STATUSES = ["reading", "finished", "want_to_read"];

function toNumber(value: FormDataEntryValue | null) {
  const n = Number(String(value ?? "").trim());
  return String(value ?? "").trim() === "" || Number.isNaN(n) ? null : n;
}

function toText(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  return s === "" ? null : s;
}

function readBook(formData: FormData) {
  const status = String(formData.get("status") ?? "reading");
  return {
    title: String(formData.get("title") ?? "").trim(),
    author: toText(formData.get("author")),
    publication_year: toNumber(formData.get("publication_year")),
    genre: toText(formData.get("genre")),
    total_pages: toNumber(formData.get("total_pages")),
    cover_url: toText(formData.get("cover_url")),
    isbn: toText(formData.get("isbn")),
    status: STATUSES.includes(status) ? status : "reading",
  };
}

export async function lookupBooks(query: string): Promise<{ results?: BookSuggestion[]; error?: string }> {
  if (!query.trim()) return { results: [] };
  try {
    return { results: await searchBooks(query) };
  } catch {
    return { error: "Couldn't reach Open Library. You can still type the details in yourself." };
  }
}

export async function createBook(_prev: BookFormState, formData: FormData): Promise<BookFormState> {
  const book = readBook(formData);
  const fieldErrors = validateBook(book);
  if (hasErrors(fieldErrors)) return { error: FIX_FIELDS, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.from("books").insert(book).select("id").single();
  if (error) return { error: "Couldn't save the book. Please try again." };

  revalidatePath("/books");
  redirect(`/books/${data.id}`);
}

export async function updateBook(id: string, _prev: BookFormState, formData: FormData): Promise<BookFormState> {
  const book = readBook(formData);
  const fieldErrors = validateBook(book);
  if (hasErrors(fieldErrors)) return { error: FIX_FIELDS, fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("books").update(book).eq("id", id);
  if (error) return { error: "Couldn't save your changes. Please try again." };

  revalidatePath("/books");
  revalidatePath(`/books/${id}`);
  redirect(`/books/${id}`);
}

export async function deleteBook(id: string) {
  const supabase = await createClient();
  await supabase.from("books").delete().eq("id", id);

  revalidatePath("/books");
  redirect("/books");
}

// One row in `stars` per user + book; Row Level Security fills in and checks the user
export async function setStarred(bookId: string, starred: boolean) {
  const supabase = await createClient();
  if (starred) {
    await supabase.from("stars").upsert({ book_id: bookId }, { onConflict: "user_id,book_id", ignoreDuplicates: true });
  } else {
    await supabase.from("stars").delete().eq("book_id", bookId);
  }

  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
}

// One-click add from the "You might like" section
export async function addToWantToRead(book: BookSuggestion): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("books").insert({
    title: book.title,
    author: book.author,
    publication_year: book.publication_year,
    genre: book.genre,
    total_pages: book.total_pages,
    cover_url: book.cover_url,
    isbn: book.isbn,
    status: "want_to_read",
  });
  if (error) return { error: "Couldn't add that book. Please try again." };

  revalidatePath("/books");
  return {};
}
