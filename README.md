# Logabook

A personal reading library and daily reading log. Keep your books as a shelf of covers, log the pages you read each day, save quotes and notes, and see whether you hit your 10-pages-a-day goal.

**Live app:** https://logabook.vercel.app

## What it does
- **Accounts:** sign up, log in and log out. Each reader only ever sees their own books.
- **Calendar (home page):** a month view where days you hit your 10-page goal are green with ✓, days you read less are yellow with •, and days with no reading are grey.
- **Streaks:** your current and longest run of goal days.
- **Library:** your books as a grid of covers, most recently read first. Search by title or author, filter by status or genre, sort by last read, title or year, and switch to your **Starred** books.
- **Add a book:** search Open Library to fill in the cover, author, year, genre and page count, or type them in.
- **Book page:** your current page and progress, every reading session, and all your notes and quotes. Edit or delete the book (with an "are you sure?" step).
- **Log reading:** pick a book, enter the pages you read, and add any quotes and notes.
- **Dashboard:** a bar chart of pages read per week, plus total pages, average pages per reading day, days goal hit, books finished and best month.
- **You might like:** book suggestions from Open Library based on the authors and genres you're reading, with one click to add them as "Want to read".

## Tools
- **Next.js 15** (App Router, TypeScript) with **Tailwind CSS**
- **Recharts** for the dashboard chart
- **Open Library API** for book search, covers and recommendations (free, no key needed)
- **Vitest** for the tests
- **Supabase**: Postgres database and email/password sign-up and login
- **Vercel**: hosting
- **Claude Code**: AI coding agent. Prompts for each feature are in [`prompts/`](prompts/).

## Run it locally
1. Install Node.js 20 or newer.
2. Clone the repo and install packages:
   ```bash
   git clone https://github.com/karimosman1/logabook.git
   cd logabook
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key. You'll find both in the Supabase dashboard under **Project Settings → API**.
4. Create the tables by running the SQL files in [`supabase/migrations/`](supabase/migrations/) in order, in the Supabase SQL editor.
5. Start the app:
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000.

## Run the tests
```bash
npm test
```
- **Dashboard stat test** ([`tests/dashboard-stat.test.ts`](tests/dashboard-stat.test.ts)): sessions of 12, 8 and 10 pages give an average of 10 pages per day and 2 days goal hit. It needs nothing extra.
- **Data isolation test** ([`tests/data-isolation.test.ts`](tests/data-isolation.test.ts)): User A adds "Dune", and User B can't see it or open it by its id. It signs in to your Supabase project, so it needs two test accounts:
  1. Sign up two accounts in the app. Leave User B's library empty.
  2. Create a file called `.env.test.local` with their emails and passwords. The setting names are listed at the bottom of [`.env.example`](.env.example). Git ignores this file, so the passwords never get committed.

## Docs
- [PLAN.md](PLAN.md): the original plan, plus the Plan vs. Reality table at the bottom
- [schema.md](schema.md): database tables and relationships
- [`prompts/`](prompts/): the prompt log for each feature, with what was built, how it was tested and the bugs caught
