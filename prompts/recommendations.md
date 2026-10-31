# Prompt log — Feature 11: Recommendations (custom feature)

## Prompt 1 (Claude Code, 2026-10-31)
> Merged, proceed

## What the agent built
- **Open Library lookups** (`src/lib/openlibrary.ts`): `booksByAuthor` and `booksBySubject` fetch the top-rated books (`sort=rating`) by an author or in a subject. Results are cached for a day.
- **`recommend()`** (`src/lib/recommendations.ts`):
  - takes "seed" books, which are the books you're currently reading (or your 3 most recent if none are in progress);
  - looks up each seed's **author** ("More by Frank Herbert") and **genre** ("Popular in Fantasy");
  - takes turns between those lists, so one prolific author can't fill all 8 slots;
  - drops any book whose title is already in your library;
  - if one lookup fails, the rest still show.
- **"You might like" section** at the bottom of the library (only in the unfiltered All books view):
  - "Based on Dune, The Hobbit."
  - up to 8 suggestions, each with cover, title, author, year and the reason;
  - a **+ Want to read** button that adds the book to your library in one click, with status "Want to read".
- The section loads separately (React Suspense), so the library appears straight away while Open Library answers.

## How it was tested (locally, with the test account)
- **Seeds were Dune and The Hobbit.** The suggestions were *The Fellowship of the Ring*, *Dune Messiah*, *The Return of the King*, *Children of Dune* and *The Lord of the Rings* (same authors), plus *Words of Radiance*, *The Hitchhiker's Guide to the Galaxy* and *Percy Jackson's Greek Gods* (same genres).
- **Project Hail Mary**, the top "Science fiction" result, was correctly left out because it's already on the shelf.
- **Clicking + Want to read on Dune Messiah** added it to the shelf as "Want to read", and it dropped out of the suggestions (Watchmen took its place).

## Debugging detour: suggestions stuck on "Finding books you might like…"
After adding Dune Messiah, reloading the library left the section stuck on its loading message. The agent worked through it step by step:
1. **The dev server was in a broken state** (missing internal files from switching branches). It restarted the server, but the section was still stuck.
2. **Checked whether Open Library was slow:** each lookup took 0.1–0.3 seconds, so it wasn't.
3. **Checked the page itself:** the HTML the server sent *did* contain all 8 suggestions, hidden and waiting to replace the loading message.
4. **Ran a production build on a separate port:** same result, so it wasn't a dev-only problem.
5. **Found the cause:** React waits for the browser's next animation frame before swapping streamed content in. The agent's browser pane was *hidden*, and a hidden browser doesn't draw frames. A quick check confirmed `requestAnimationFrame` never fired. Taking a screenshot made the pane draw, and the suggestions appeared straight away.

**Conclusion:** not a bug in the app. A real, visible browser shows the suggestions normally. It was a quirk of the testing setup, but it took a while to rule out real causes.

## Plan vs. reality notes
- **This was the feature PLAN.md was least sure about, and genre data is the weak spot, as predicted.** Because the plan stored a single `genre` taken from Open Library's subjects, "Popular in Science fiction" suggested *Watchmen*, a graphic novel. Better suggestions would need several subjects per book, not one column.
- **Author matching works well.** Same-author suggestions were the most relevant.
- **"Added to Want to read ✓" never shows.** After you click, the library refreshes and the suggestion disappears (it's now on your shelf), so the confirmation message never gets a chance to appear. It works, but the feedback is the book moving rather than a message.
