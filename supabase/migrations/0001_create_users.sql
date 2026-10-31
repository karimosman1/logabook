-- Profile row for every Supabase Auth account (PLAN.md section 3: users)
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  daily_page_goal integer not null default 10,
  created_at date not null default current_date
);

-- Supabase exposes public tables through its API, so lock rows to their owner
alter table public.users enable row level security;

create policy "Users can read their own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile row automatically when someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only the trigger should run this, not API callers
revoke execute on function public.handle_new_user() from public, anon, authenticated;
