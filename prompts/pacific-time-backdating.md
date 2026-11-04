# Prompt log — Pacific time and logging up to 7 days back

## Prompt 1 (Claude Code, 2026-11-04)
> i need to make additional changes before, show these changes in the plan vs reality table as well. let's make sure that the clock is set to PST because this is where most users will be located. i would also want to make it possible to retroactively add logs for up to 7 days before today, and still have it count for your current streak.

## What the agent built
- **One "today" for the whole app, in Pacific time** (`src/lib/dates.ts`).
  - The calendar, streaks, dashboard weeks and the log form now all use the same date.
  - Before, the calendar, streaks and dashboard used the server's UTC clock, which is 7–8 hours ahead of California. The log form used the browser's clock, so they could disagree.
  - It uses the `America/Los_Angeles` time zone, so it switches between PST in winter and PDT in summer by itself.
- **Logging up to 7 days back.**
  - The log form's date picker only offers today and the 7 days before it.
  - A hint under it says "Forgot a day? Up to 7 days back."
  - The server refuses older dates with "You can only log reading from the last 7 days.", and future dates with "That date is in the future."
- **Backdated logs count for the streak.** The streak is worked out from every session's date, so a forgotten day logged later fills the gap and reconnects the current streak. Nothing extra was needed.
- **Cleanup:** the date helper `addDays` used to be copied in two files. It now lives once in `dates.ts`.

## How it was tested
- **New tests in `tests/backdating.test.ts`:**
  - 6:30am UTC on Nov 4 is still Nov 3 in Pacific time (10:30pm PST);
  - the same works in summer (PDT);
  - today and 7 days ago are accepted, while 8 days ago and tomorrow are refused;
  - a streak broken by a missing Nov 2 (current streak 2) becomes 4 once Nov 2 is logged later.
- **All 9 tests pass** (`npm test`), along with the type check and lint.
- **Not checked in the browser by the agent:** the browser was logged out, and the agent doesn't type passwords into sign-in pages. Karim checks the log form on the PR's Vercel preview.

## Plan vs. reality notes
- **PLAN.md ignored timezones completely.** This closes the "today is UTC" gap noted in the calendar, streak and dashboard prompt logs.
- **Pacific time is now fixed for everyone.** A reader in New York would see the day change at 3am, not midnight. That's the tradeoff for keeping it simple when most readers are on the West Coast.
- **The 7-day limit is new.** The plan didn't say anything about logging past days, and before this, any past date was allowed, even years back.
