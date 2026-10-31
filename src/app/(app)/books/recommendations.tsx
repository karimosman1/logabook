import { BookCover } from "@/components/book-cover";
import { recommend, type Seed } from "@/lib/recommendations";
import { AddRecommendationButton } from "./add-recommendation-button";

type Props = { seeds: Seed[]; ownedTitles: string[] };

// Rendered inside <Suspense> so the library shows immediately while Open Library answers
export async function Recommendations({ seeds, ownedTitles }: Props) {
  const picks = await recommend(seeds, ownedTitles);

  if (!picks.length) {
    return (
      <p className="mt-3 text-sm text-ink-muted">
        No suggestions right now. Add an author or genre to the books you&apos;re reading to get some.
      </p>
    );
  }

  return (
    <ul className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
      {picks.map((book) => (
        <li key={book.key}>
          <BookCover title={book.title} coverUrl={book.cover_url} />
          <p className="mt-2 line-clamp-2 font-serif text-ink">{book.title}</p>
          <p className="text-sm text-ink-muted">
            {[book.author, book.publication_year].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 text-xs text-accent">{book.reason}</p>
          <AddRecommendationButton book={book} />
        </li>
      ))}
    </ul>
  );
}

export function RecommendationsLoading() {
  return <p className="mt-3 text-sm text-ink-muted">Finding books you might like…</p>;
}
