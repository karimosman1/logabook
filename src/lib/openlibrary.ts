// Book lookups through the free Open Library API (no key needed)
// https://openlibrary.org/dev/docs/api/search

export type BookSuggestion = {
  key: string;
  title: string;
  author: string | null;
  publication_year: number | null;
  genre: string | null;
  total_pages: number | null;
  cover_url: string | null;
  isbn: string | null;
};

type SearchDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
  isbn?: string[];
  subject?: string[];
};

const FIELDS = "key,title,author_name,first_publish_year,cover_i,number_of_pages_median,isbn,subject";

export function coverUrl(coverId: number) {
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

export async function searchBooks(query: string): Promise<BookSuggestion[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=${FIELDS}&limit=8`;
  const res = await fetch(url, { headers: { "User-Agent": "Logabook (student project)" } });
  if (!res.ok) throw new Error(`Open Library search failed (${res.status})`);

  const { docs } = (await res.json()) as { docs: SearchDoc[] };
  return docs.map((doc) => ({
    key: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] ?? null,
    publication_year: doc.first_publish_year ?? null,
    // PLAN.md keeps one genre per book, so take Open Library's first subject
    genre: doc.subject?.[0] ?? null,
    total_pages: doc.number_of_pages_median ?? null,
    cover_url: doc.cover_i ? coverUrl(doc.cover_i) : null,
    isbn: doc.isbn?.[0] ?? null,
  }));
}
