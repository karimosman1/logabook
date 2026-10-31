# Prompt log — Feature 1: Sign up & login

## Prompt 1 (Claude Code, 2026-10-31)
> Yes, start Feature 1

(Earlier in the session: "Create a new one" → the agent created a new free Supabase project `logabook` in us-west-1.)

## What the agent built
- Set up a Next.js 15 app (App Router, TypeScript, Tailwind) using the "paper and ink" colours from PLAN.md.
- `users` table in Supabase (`supabase/migrations/0001_create_users.sql`). A database trigger creates a `users` row each time someone signs up through Supabase Auth.
- `/signup`, `/login` and a "Log out" button. These use server actions with friendly error messages, such as "Please enter your email and password."
- Middleware that sends logged-out visitors to `/login`.
- `/auth/callback`, which handles the confirmation email link.

## Where it went differently from the plan
- **Row Level Security turned on from day one.** PLAN.md said "every query filters by `user_id`". But Supabase exposes every table in the `public` schema through its API, so without RLS anyone with the public key could read every profile. The agent enabled RLS so each user can only read and update their own row. This is the agent's call, flagged to me in chat.
- **Security advisor warning.** After the first migration, Supabase's security advisor warned that the sign-up trigger function could be called through the API. The agent revoked `EXECUTE` on it, which is now the last line of the migration.
- **Email confirmation blocks sign-up.** Testing sign-up with `test.reader+logabook@example.com` returned: *Email address "…" is invalid*. Supabase's built-in email sender only delivers to the project team's own addresses, so a stranger couldn't sign up. Fix: turn off "Confirm email" in Supabase (Authentication → Sign In / Providers → Email).
