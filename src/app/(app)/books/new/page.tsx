import { createBook } from "../actions";
import { BookForm } from "../book-form";

export const metadata = { title: "Add a book · Logabook" };

export default function NewBookPage() {
  return (
    <>
      <h1 className="mb-6 font-serif text-3xl text-ink">Add a book</h1>
      <BookForm action={createBook} submitLabel="Add to library" cancelHref="/books" showSearch />
    </>
  );
}
