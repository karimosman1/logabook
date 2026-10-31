import { booksByAuthor, booksBySubject, type BookSuggestion } from "./openlibrary";

export type Seed = { title: string; author: string | null; genre: string | null };
export type Recommendation = BookSuggestion & { reason: string };

// Titles compared loosely: "The Hobbit" and "the hobbit " are the same book
const normalize = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Suggest books by the same authors, then in the same genres, as the seed books.
 * Picks take turns between sources so one prolific author can't fill the whole list.
 */
export async function recommend(seeds: Seed[], ownedTitles: string[], limit = 8): Promise<Recommendation[]> {
  const authors = [...new Set(seeds.map((s) => s.author).filter((a): a is string => !!a))];
  const genres = [...new Set(seeds.map((s) => s.genre).filter((g): g is string => !!g))];

  const sources = await Promise.all([
    ...authors.map(async (author) => ({ reason: `More by ${author}`, books: await safe(booksByAuthor(author)) })),
    ...genres.map(async (genre) => ({ reason: `Popular in ${genre}`, books: await safe(booksBySubject(genre)) })),
  ]);

  const seen = new Set(ownedTitles.map(normalize));
  const picks: Recommendation[] = [];

  for (let round = 0; picks.length < limit && sources.some((s) => s.books.length > round); round++) {
    for (const source of sources) {
      const book = source.books[round];
      if (!book || seen.has(normalize(book.title))) continue;
      seen.add(normalize(book.title));
      picks.push({ ...book, reason: source.reason });
      if (picks.length === limit) break;
    }
  }
  return picks;
}

// One failed lookup shouldn't take down the whole section
async function safe(promise: Promise<BookSuggestion[]>) {
  try {
    return await promise;
  } catch {
    return [];
  }
}
