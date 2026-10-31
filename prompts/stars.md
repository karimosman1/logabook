# Prompt log — Feature 6: Stars

## Prompt 1 (Claude Code, 2026-10-31)
> Merged, proceed

## What the agent built
- **Star button (☆ / ★)** on every cover in the library grid and next to the title on each book page.
  - It flips straight away (an "optimistic" update) while the server saves in the background.
  - Screen readers hear "Star Dune" or "Unstar Dune".
- **Saving:** starring adds one row to the `stars` junction table (user + book). Unstarring deletes it. Row Level Security fills in and checks the user, so a user can only star their own books.
- **Starred view:** "All books" and "★ Starred" tabs at the top of the library (`/books?view=starred`). With no stars, it shows: "No starred books yet. Tap the ☆ on a book you loved to keep it here."

## How it was tested (locally, with the test account)
- Starred Dune from the library grid. The button changed to "Unstar Dune", and the Starred view showed only Dune.
- In the database, there was exactly one `stars` row, for the test user and Dune.
- Unstarred Dune from its book page. The Starred view went back to the empty message.

## Plan vs. reality notes
- The `stars` table was built exactly as planned (composite primary key `user_id` + `book_id`), so this feature needed no schema changes.
- The plan didn't say where the starred view lives. It became a tab on the library rather than its own page, so it can share the search, filter and sort coming in Feature 7.
