-- How much the reader liked a book, from 1 to 5. Empty until they rate it.
alter table public.books
  add column rating smallint check (rating between 1 and 5);
