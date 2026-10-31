# PLAN — Logabook (reading tracker)

## 1. Pitch
I'm building **Logabook**, a personal reading library and log, because I want to read 10 pages every day and I keep losing track of where I am in each book and what I wanted to remember from it. I'll use it daily: one entry after every reading session, about 5–7 times a week.

## 2. Features (in build order)
1. **Sign up & login (spine):** As a reader, I want to create an account with email and password and log in and out, so that my library is private to me.
2. **Data model (spine):** As a reader, I want my books, reading sessions and notes stored in connected tables, so that each session and note belongs to the right book.
3. **Book library CRUD (spine):** As a reader, I want to add a book by searching its title, with the cover, author, publication year, genre and page count filled in from Open Library, then view my library as a grid of covers sorted by the last one I read, open a book's detail page, edit it, and delete it after an "Are you sure?" prompt, so that my shelf reflects what I'm actually reading.
4. **Log a reading session:** As a reader, I want to add an entry for a new or existing book with the date, start page, end page, any quotes I highlighted and any notes, so that the book page shows my current page and every past note and quote.
5. **Validation (spine):** As a reader, I want a friendly message if I leave the title blank, or enter an end page lower than the start page or higher than the book's page count, so that bad entries don't mess up my stats.
6. **Stars (spine):** As a reader, I want to star favourite books and see a "Starred" view, so that I can find the books I loved.
7. **Find things (spine):** As a reader, I want to search my library by title or author, filter by status (reading / finished / want to read) and genre, and sort by last read, title or year, so that I can find a book quickly.
8. **Dashboard (spine):** As a reader, I want a bar chart of pages read per week, plus stats (books finished, average pages per day, best month), so that I can see if I'm improving.
9. **Calendar view (custom):** As a reader, I want the app to open on a monthly calendar where days I read ≥ 10 pages are green, days I read 1–9 pages are yellow, and days with no reading are grey, so that I can see my consistency at a glance.
10. **Streak counter (custom):** As a reader, I want to see my current and longest streak of days where I hit my 10-page goal, so that I stay motivated not to break the chain.
11. **Recommendations (custom):** As a reader, I want a "You might like" section at the bottom of the library that suggests books by the same authors or in the same genres as the books I'm reading, so that I always know what to read next.

## 3. Database
Auth is handled by Supabase (`auth.users`). My own `users` table mirrors it with profile info.

**users**: `id` uuid PK (= auth user id) · `email` text · `display_name` text · `daily_page_goal` number (default 10) · `created_at` date

**books**: `id` uuid PK · `user_id` uuid FK → users.id · `title` text (required) · `author` text · `publication_year` number · `genre` text · `total_pages` number · `cover_url` text · `isbn` text · `status` text (reading / finished / want_to_read) · `last_read_at` date · `created_at` date

**reading_sessions**: `id` uuid PK · `book_id` uuid FK → books.id · `user_id` uuid FK → users.id · `session_date` date · `start_page` number · `end_page` number · `pages_read` number · `created_at` date

**notes**: `id` uuid PK · `session_id` uuid FK → reading_sessions.id · `book_id` uuid FK → books.id · `kind` text (note / quote) · `content` text (required) · `page_number` number · `created_at` date

**stars**: `user_id` uuid FK → users.id · `book_id` uuid FK → books.id · `created_at` date · PK = (`user_id`, `book_id`)

Relationships:
- users 1 → many books
- books 1 → many reading_sessions
- reading_sessions 1 → many notes
- users many ↔ many books through **stars** (junction table)

```
users ──< books ──< reading_sessions ──< notes
  │         │
  └──< stars >┘
```

## 4. Tests
- **Data isolation:** Given User A has added the book "Dune" and User B has an empty account, when User B logs in and loads the library, then User B sees zero books and cannot open Dune's detail page by its URL.
- **Dashboard stat:** Given a user logged sessions of 12, 8 and 10 pages on three different days this week, when the dashboard loads, then "average pages per day" shows 10 and "days goal hit" shows 2.

## 5. Technologies
- **Coding agent: Claude Code.** It works in my local repo and can run git and gh commands, which fits the issue → branch → PR loop.
- **Framework: Next.js (App Router, TypeScript).** One project covers the pages and the server code, and it deploys to Vercel without setup.
- **Database: Supabase (Postgres).** It's a real relational database with foreign keys, and it has a free tier.
- **Sign up / login: Supabase Auth with email and password.** Sign-up, login and logout come built in, and every query filters by the logged-in user's `user_id`.
- **Hosting: Vercel.** It deploys on every merge to main, so the live URL stays current.
- **Book data: Open Library API** (search + covers). It's free and needs no API key, and it returns the cover, author, year and page count.
- **Libraries:** Tailwind CSS for quick styling, Recharts for the dashboard chart, date-fns for calendar and streak date maths, and Vitest for the tests.

## 6. Design
A warm, cosy "paper and ink" look: cream background (#FAF7F0), dark ink text (#2B2A28), a forest-green accent (#2F6B4F) for "goal hit", mustard (#E0B341) for partial days, and light grey for missed days. A serif font for book titles and a sans-serif for the UI. Covers are the main visual, shown in a shelf-like grid. Inspiration: **StoryGraph** (clean reading stats), **Goodreads** (cover shelf), and **GitHub's contribution graph** (the calendar colours).

## 7. Risks and cuts
- **Least sure about:** recommendations. I don't know how good Open Library's author and subject data is, or how to rank suggestions.
- **Cut first:** recommendations. Then I'd simplify the streak to "current streak" only.
- **Other risk:** Open Library may not have a cover or page count for every book, so manual entry has to work as a fallback.

