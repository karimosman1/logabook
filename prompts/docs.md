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
