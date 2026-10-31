# Prompt log — Test: dashboard stat

## Prompt 1 (Claude Code, 2026-10-31)
> Merged, proceed

## What the agent built
- **Vitest** (the test runner from PLAN.md section 5), plus an `npm test` script.
- **`tests/dashboard-stat.test.ts`:** the dashboard test from PLAN.md section 4.
  - **Given:** sessions of 12, 8 and 10 pages on three different days.
  - **When:** the dashboard's `summarize()` function works out the stats, with a daily goal of 10.
  - **Then:** average pages per day is 10, and days goal hit is 2.
- The test calls the same `summarize()` the dashboard page uses, so it checks the real calculation, not a copy of it.

## Red, then green
- **Red:** the agent temporarily changed "goal hit" from `pages >= goal` to `pages > goal`, so a day of exactly 10 pages no longer counted. The test failed with `expected 1 to be 2`.
- **Green:** after reverting the change, the test passed.

## Bugs caught along the way
- **Vitest wouldn't install at first.** It needs a newer version of `@types/node` (the Node.js type definitions) than the project started with. The agent bumped `@types/node` from v20 to v22. That only affects type checking, not how the app runs.

## Plan vs. reality notes
- **The test matches the plan exactly.** The only decision the plan didn't make: "average pages per day" means per day you *read*, not per calendar day. Here both give 10, because there are 3 reading days.
