# Prompt log — Rate each book out of 5 (stranger test, part of struggle #3)

## Prompt 1 (Claude Code, 2026-11-04)
> […] only the rating out of 5 for number 3, we can keep the rest of 3 for the next iteration because i think it involves much more work and could benefit from APIs but i'd like your opinion on it too. […] 3. it would be nice to have friends on this app to see what they had rated other books and to get inspiration from books they were reading for example, and maybe add a rating system to show how much i liked every book

## What the agent built
- **A new `rating` column on `books`** (`supabase/migrations/0004_book_rating.sql`).
  - It's a number from 1 to 5, or empty until you rate the book.
  - The database refuses anything outside 1–5.
  - The migration was applied to Supabase, and the TypeScript types were updated.
- **The book page** has five stars under the author, labelled with "4/5" or "Not rated yet".
  - Click a star to rate.
  - Click your current rating again to clear it.
  - It updates straight away, like the favourite star.
- **The library grid** shows each rated book's stars next to its status.
- **A new sort option:** "Highest rated". Unrated books go last.
- **schema.md** lists the new column and its check.

## How it was tested
- **Against the real database, as test User A:** a book rated 4 saved and read back as 4, and a rating of 6 was refused by the database check. The test book was deleted afterwards.
- Type check, lint and all 9 tests pass.
- **Not tried in the browser by the agent** (it was logged out). Karim checks it on the PR's Vercel preview.

## Decisions
- **Ratings live on the book row, not in a separate table.** Each book belongs to one reader, so there's one rating per book. If friends are added later and books get shared between readers, ratings would need their own table (reader + book + rating), like `stars`.
- **Two kinds of stars now:** the round ☆ button marks a favourite (the "Starred" tab), and the row of five small stars is the rating. They're labelled differently, but a stranger might still mix them up. Worth watching in the next stranger test.

## Left for the next iteration: friends
- The friends part of struggle #3 (following friends and seeing their ratings and current books) wasn't built. Reasons:
  - **The privacy model changes.** Today every rule says "only your own rows". Friends need "your rows, plus your friends' rows, but only once they've accepted". That touches every security rule, and the isolation test would need a new version.
  - **New tables and screens:** friend requests (who asked, who accepted), finding someone by email or username, accepting or declining, and a friends feed.
  - **It's more about the database than outside APIs.** Open Library can't help with friends. The useful outside piece would be email, to invite a friend who isn't on the app yet.
