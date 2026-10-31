# Prompt log — Feature 2: Data model

## Prompt 1 (Claude Code, 2026-10-31)
> Feature 2 first

(The agent had suggested deploying to Vercel first. I chose to build the data model before deploying.)

## What the agent built
- `supabase/migrations/0002_create_library_tables.sql` creates `books`, `reading_sessions`, `notes` and `stars`, with the columns from PLAN.md section 3. It was applied to the Supabase project.
- Foreign keys connect users → books → reading_sessions → notes, plus `stars` as the junction table between users and books. Deleting a book also deletes its sessions, notes and stars.
- Row Level Security on every table. `notes` has no `user_id` (as planned), so its policy checks ownership through the book.
- Database checks so `status` can only be `reading` / `finished` / `want_to_read`, and `kind` only `note` / `quote`.
- TypeScript types generated from the database (`src/lib/database.types.ts`) and connected to the Supabase client.
- `schema.md` documents every table, column and relationship, and compares them with the plan.

## How it was checked
- **Supabase security advisor:** no warnings about the new tables. The only warning left is "Leaked password protection disabled", which is an Auth setting, not part of this feature.
- **Supabase performance advisor:** only "unused index" notices, which is expected because the tables are still empty.
- **Isolation test in SQL, rolled back afterwards so nothing was saved:**
  - As the test user, the agent added a book, a session, a quote and a star. That user sees 1 of each.
  - Switching to a different user id shows 0 books, 0 sessions, 0 notes and 0 stars.
  - That other user trying to add a note to the first user's book is rejected: `new row violates row-level security policy for table "notes"`.
- **Snag during testing:** the first version of the test inserted the book and its star in one SQL statement, and the star was rejected. That was a quirk of the test (rows inserted in one statement can't see each other yet), not a bug in the policies. Splitting it into separate statements fixed it.

## Kept from the plan on purpose (may change later)
- `genre` is a single text column.
- `reading_sessions` stores `pages_read` next to `start_page` / `end_page`.
- `books.last_read_at` has to be updated whenever a session is logged.
- Dates are plain `date` values with no timezone.
