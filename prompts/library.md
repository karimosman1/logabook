# Prompt log — Feature 3: Book library (create / read / update / delete)

## Prompt 1 (Claude Code, 2026-10-31)
> all three tasks you asked for are done. proceed

(The three tasks: install Vercel's GitHub app, sign up on the live site, merge the deploy PR.)

Before starting, the agent checked those tasks. My account exists and the PR was merged. But no new deploy had appeared after the merge: the GitHub repo still wasn't linked in Vercel. Re-running `vercel git connect` worked now that the GitHub app was installed, and the agent redeployed `main`.

## What the agent built
- **Open Library search** (`src/lib/openlibrary.ts`). It searches by title or author and returns the title, first author, first publication year, first subject (used as the genre), median page count, cover image and an ISBN.
- **`/books`**: the library as a grid of covers, sorted by `last_read_at` (most recent first), then by date added. Books with no cover get a green placeholder with the title. `/` now redirects here until the calendar is built.
- **`/books/new`**: search Open Library, click a result to fill in the form, then save. Every field can also be typed or changed by hand.
- **`/books/[id]`**: the detail page, with cover, author, year, genre, pages, "You're on page X of Y" with a progress bar, Edit and Delete buttons, and the book's notes and quotes (empty until reading sessions exist).
- **`/books/[id]/edit`**: the same form, filled in with the book's details.
- **Delete** asks: "Are you sure you want to delete Dune? Its reading sessions and notes will be deleted too." The book is only deleted after "Yes, delete".
- A shared navigation bar with Library, Add book and Log out.

## How it was tested (locally, with the test account)
- Searched "dune frank herbert" and picked the first result. The form filled in: Dune, Frank Herbert, 1965, 608 pages, with a cover.
- Saved the book. The detail page shows its info and "Page 0 of 608".
- Edited the genre and the change showed up.
- On delete, the confirmation appears. Cancel keeps the book; "Yes, delete" removes it and goes back to the empty library. The old URL then shows a 404.

## Things I noticed (for Plan vs. Reality)
- **The genre from Open Library is often not a genre.** For Dune, the first "subject" is *Dune (Imaginary place)*. PLAN.md assumed Open Library returns a genre, but it returns a long list of subjects (places, characters, themes, genres all mixed together). With one `genre` column, the app can only keep one and can't tell which is the real genre. For now you fix it by hand when adding a book. This will matter again for recommendations.
- **Cover images load slowly** (a second or two) because they come from Open Library at full size.
- **`last_read_at` isn't set by anything yet**, so the "most recently read first" order is really "most recently added first" until logging a reading session updates it.
- **An empty title is accepted for now.** Friendly validation messages are a separate feature (PLAN.md feature 5).
