# Prompt log — Feature 7: Find things (search, filter, sort)

## Prompt 1 (Claude Code, 2026-10-31)
> Merged, proceed

## What the agent built
A filter bar on the library (`/books`):
- **Search box:** matches the title or author as you type (case-insensitive). It waits for a short pause so not every keystroke sends a request.
- **Status filter:** any, reading, want to read, finished.
- **Genre filter:** lists the genres actually in your library.
- **Sort:** last read (default), title A–Z, year published (newest first), or recently added. The line under the heading says which sort is on.

How it behaves:
- Everything lives in the URL (`?q=…&status=…&genre=…&sort=…`), so a refresh keeps your filters.
- The All books and ★ Starred tabs keep the search, filters and sort when you switch.
- When nothing matches, the page says "No books match those filters." with a link to clear them.
- Commas and brackets are stripped from the search, because they have special meaning in Supabase's filter syntax.

## How it was tested (locally, with 3 test books: Dune, The Hobbit, Project Hail Mary)
- Typing "tolk" shows only The Hobbit, and the URL becomes `?q=tolk`.
- Genre "Science fiction" shows Dune and Project Hail Mary.
- Status "finished" shows Project Hail Mary.
- Sort by title gives Dune, Project Hail Mary, The Hobbit.
- Sort by year gives Project Hail Mary (2021), Dune (1965), The Hobbit (1937).
- Searching `zzz,()` shows the "No books match" message instead of an error.
- In the Starred view with status "reading", changing the sort dropdown kept all three settings in the URL, and the "All books" tab link kept the filters.

## Plan vs. reality notes
- **The genre filter is only as good as the genre data.** With one `genre` column filled from Open Library's first "subject", the dropdown can fill up with things like *Dune (Imaginary place)* unless genres are fixed by hand. This is the same gap noted in Feature 3.
- **Search only covers title and author,** as planned. It doesn't look inside notes or quotes.
