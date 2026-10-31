-- Library tables from PLAN.md section 3: books, reading_sessions, notes, stars

create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  title text not null,
  author text,
  publication_year integer,
  genre text,
  total_pages integer,
  cover_url text,
  isbn text,
  status text not null default 'reading'
    check (status in ('reading', 'finished', 'want_to_read')),
  last_read_at date,
  created_at date not null default current_date
);

create table public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  session_date date not null default current_date,
  start_page integer,
  end_page integer,
  pages_read integer,
  created_at date not null default current_date
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.reading_sessions (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  kind text not null default 'note' check (kind in ('note', 'quote')),
  content text not null,
  page_number integer,
  created_at date not null default current_date
);

-- Junction table: "this user starred this book"
create table public.stars (
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  created_at date not null default current_date,
  primary key (user_id, book_id)
);

-- Indexes for the foreign keys the app filters and joins on
create index books_user_id_idx on public.books (user_id);
create index reading_sessions_book_id_idx on public.reading_sessions (book_id);
create index reading_sessions_user_id_date_idx on public.reading_sessions (user_id, session_date);
create index notes_book_id_idx on public.notes (book_id);
create index notes_session_id_idx on public.notes (session_id);
create index stars_book_id_idx on public.stars (book_id);

-- Row Level Security: every row is visible only to the user who owns it
alter table public.books enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.stars enable row level security;

create policy "Users manage their own books"
  on public.books for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own reading sessions"
  on public.reading_sessions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.books b where b.id = book_id and b.user_id = (select auth.uid()))
  );

-- notes has no user_id column, so ownership comes from the book it belongs to
create policy "Users manage notes on their own books"
  on public.notes for all
  to authenticated
  using (exists (select 1 from public.books b where b.id = book_id and b.user_id = (select auth.uid())))
  with check (exists (select 1 from public.books b where b.id = book_id and b.user_id = (select auth.uid())));

create policy "Users manage their own stars"
  on public.stars for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.books b where b.id = book_id and b.user_id = (select auth.uid()))
  );
