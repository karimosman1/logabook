# Prompt log — Test: data isolation

## Prompts (Claude Code, 2026-10-31)
> added the screenshots and merged

> i created the two test accounts and filled in the env file

> Yes, add it  (the temporary rule for the red screenshot)

> Red done, remove it

## What the agent built
- **`tests/data-isolation.test.ts`:** the isolation test from PLAN.md section 4. It talks to the real Supabase project, signed in as two real accounts, like two people using the app.
  - **Given:** User A adds the book "Dune". User B has an empty account.
  - **When:** User B loads the library, and then looks Dune up by its id (what the `/books/<id>` page does).
  - **Then:** User B gets zero books, and nothing back for Dune's id.
  - **A first check confirms User A *can* see Dune.** Without it, the test would also "pass" if the insert had silently failed.
  - **Afterwards, User A deletes the test's Dune,** so runs don't pile up books.
- **`vitest.config.mts`:** loads the Supabase settings from `.env.local` and the test accounts from `.env.test.local`.
- **The test accounts' passwords live only in `.env.test.local`,** which git ignores. `.env.example` lists the names of the settings, with no values.
- **Karim created the two test accounts** on the live site. The agent doesn't create accounts or handle passwords on a live site.

## Red, then green
- **Red:** the agent temporarily added a database rule letting any logged-in user see every book. Both "User B" checks failed. Then the rule was removed.
- **Green:** with the rule removed, all checks passed.

## Bugs caught along the way
- **The test sometimes hung, then timed out.**
  - **How it was noticed:** the first full run failed after 10 seconds, but running the file on its own passed in 1 second.
  - **How it was tracked down:** the agent checked Supabase's request logs. In the stuck runs, a request never reached Supabase at all, so the stall was on the computer's network side, not in the database or the security rules.
  - **The fix:** each request now gets 8 seconds, then is retried (up to 3 tries). The time limit for the whole setup was raised to 30 seconds.
  - **The result:** 6 full runs in a row passed.
- **Cleanup deletes by title, not by id,** in case a retried "add Dune" went through twice.

## Plan vs. reality notes
- **The plan said isolation would come from "every query filters by `user_id`".** In reality it comes from Row Level Security rules in the database (added in Feature 2). That's why this test talks to the real database: filtering inside the app's code wouldn't be tested by calling a function directly.
- **The test needs real accounts and a network connection,** which the plan didn't foresee. The dashboard test runs anywhere in milliseconds.
