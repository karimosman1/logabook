# Logabook database schema

Logabook uses a Supabase (Postgres) database with 5 tables. The SQL that creates them is in [`supabase/migrations/`](supabase/migrations/).

```
auth.users ──1:1── users ──< books ──< reading_sessions ──< notes
                     │         │  └───────────────────────────<┘  (notes also point straight at their book)
                     └──< stars >┘                                (many-to-many: users ↔ books)
```

`──<` means "one to many".

## Tables

### users
One row per account. It's created automatically by a database trigger when someone signs up through Supabase Auth (`auth.users`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | **Primary key**; the same id as the Supabase Auth account |
| `email` | text | required |
| `display_name` | text | optional name from the sign-up form |
| `daily_page_goal` | integer | defaults to 10 |
| `created_at` | date | defaults to today |

### books
A book on a user's shelf.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | **Primary key** |
| `user_id` | uuid | **Foreign key → users.id**; who owns the book |
| `title` | text | required |
| `author` | text | |
| `publication_year` | integer | |
| `genre` | text | a single genre |
| `total_pages` | integer | |
| `cover_url` | text | cover image link (Open Library) |
| `isbn` | text | |
| `status` | text | `reading`, `finished` or `want_to_read` (default `reading`) |
| `last_read_at` | date | used to sort the library by the most recently read book |
| `created_at` | date | defaults to today |

### reading_sessions
One sitting of reading one book: "on this date I read pages X to Y".

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | **Primary key** |
| `book_id` | uuid | **Foreign key → books.id** |
| `user_id` | uuid | **Foreign key → users.id**; stored again here so the calendar can look up a user's days quickly |
| `session_date` | date | defaults to today |
| `start_page` | integer | |
| `end_page` | integer | |
| `pages_read` | integer | |
| `created_at` | date | defaults to today |

### notes
A note or a highlighted quote, written during a reading session.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | **Primary key** |
| `session_id` | uuid | **Foreign key → reading_sessions.id**; optional |
| `book_id` | uuid | **Foreign key → books.id**; required |
| `kind` | text | `note` or `quote` |
| `content` | text | required |
| `page_number` | integer | |
| `created_at` | date | defaults to today |

### stars (junction table)
"This user starred this book." One table for everyone.

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | **Foreign key → users.id** |
| `book_id` | uuid | **Foreign key → books.id** |
| `created_at` | date | defaults to today |

**Primary key:** (`user_id`, `book_id`) together, so a book can only be starred once per user.

## Relationships
- **users → books:** one to many. A user owns many books.
- **books → reading_sessions:** one to many. A book has many reading sessions.
- **reading_sessions → notes:** one to many. A session can have many notes and quotes.
- **books → notes:** one to many. Every note also points straight at its book, so a book page can list all its notes in one query.
- **users ↔ books through stars:** many to many.

Deleting a book also deletes its sessions, notes and stars (`on delete cascade`).

## Privacy: Row Level Security
Every table has Row Level Security turned on. A logged-in user can only read or change:
- their own `users` row,
- `books`, `reading_sessions` and `stars` rows where `user_id` is theirs,
- `notes` on books they own (notes have no `user_id`, so ownership is checked through the book).

## Compared with PLAN.md section 3
The tables and columns match the plan. What's different:
- **Row Level Security** replaces "every query filters by `user_id`". The database itself now refuses to show one user's rows to another.
- **`status` and `kind` are limited to fixed values** by a database check, which the plan didn't specify.
- **Extra indexes** on the foreign keys, to keep look-ups fast.
