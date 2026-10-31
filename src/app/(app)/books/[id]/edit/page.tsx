import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBook } from "../../actions";
import { BookForm } from "../../book-form";

export const metadata = { title: "Edit book · Logabook" };

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (!book) notFound();

  return (
    <>
      <h1 className="mb-6 font-serif text-3xl text-ink">Edit book</h1>
      <BookForm
        action={updateBook.bind(null, id)}
        submitLabel="Save changes"
        cancelHref={`/books/${id}`}
        initial={{
          title: book.title,
          author: book.author ?? "",
          publication_year: book.publication_year?.toString() ?? "",
          genre: book.genre ?? "",
          total_pages: book.total_pages?.toString() ?? "",
          cover_url: book.cover_url ?? "",
          isbn: book.isbn ?? "",
          status: book.status,
        }}
      />
    </>
  );
}
