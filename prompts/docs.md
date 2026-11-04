# Prompt log — Docs: Plan vs. Reality, README and schema

## Prompt 1 (Claude Code, 2026-10-31)
> Merged, proceed

## What the agent did
- **PLAN.md:** added the **Plan vs. Reality** table at the bottom. Nothing above it was changed.
  - One row per planned feature, plus the two tests, the libraries, and timezones (which the plan never mentioned).
  - Each row says Shipped / Changed / Cut, Done / Backlogged, and one line on what changed and why.
  - The rows were drafted from the "Plan vs. reality notes" in each prompt log in `prompts/`, so each one points back to something that really happened during the build.
- **README.md:** describes every finished feature, adds Recharts, Open Library and Vitest to the tools, adds a "Run the tests" section (including how to set up the two test accounts), and links to the prompt logs.
- **schema.md:** adds the three weak spots in the plan's design: the single `genre` column, `created_at` as a date only, and `pages_read` repeating the page range.

## Notes
- **Karim reviews the table before merging,** because it's the basis for the reflection and should say what Karim thinks, not just what the agent wrote down.
- **The biggest gap, as it stands:** the single `genre` column. It started in the plan's schema (section 3), showed up in Feature 3 (junk genres from Open Library), then Feature 7 (messy genre filter) and Feature 11 (weak genre recommendations).

## Prompt 2 (Claude Code, 2026-11-04)
> i need to make additional changes before, show these changes in the plan vs reality table as well. let's make sure that the clock is set to PST because this is where most users will be located. i would also want to make it possible to retroactively add logs for up to 7 days before today, and still have it count for your current streak.

- **The changes were built in their own feature PR** (Pacific time and logging 7 days back).
- **This PR's table was updated to match:**
  - Feature 4 (logging up to 7 days back);
  - Feature 9 (the calendar's "today" is now Pacific);
  - Feature 10 (late logs count for the streak, so it's now "Changed");
  - the timezones row (now "Changed / Done" instead of "Cut / Backlogged").
- **The README** mentions both changes too.
