-- Safety net behind the form validation (PLAN.md feature 5): the database itself
-- refuses blank titles and impossible page ranges, even if a request skips the app.
alter table public.books
  add constraint books_title_not_blank check (btrim(title) <> ''),
  add constraint books_total_pages_positive check (total_pages is null or total_pages > 0);

alter table public.reading_sessions
  add constraint reading_sessions_pages_valid check (
    start_page >= 1 and end_page >= start_page
  );

alter table public.notes
  add constraint notes_content_not_blank check (btrim(content) <> '');
