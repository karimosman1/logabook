# Prompt log — Feature 9: Calendar view (custom feature)

## Prompt 1 (Claude Code, 2026-10-31)
> Merged, proceed

## What the agent built
- **The home page (`/`) is now a monthly reading calendar.** Logging in lands here, and "Calendar" is in the nav.
- **Each day is coloured by the pages read that day.** All sessions on a day are added together.
  - **Green with ✓:** goal hit (10+ pages, or whatever `daily_page_goal` is).
  - **Yellow with •:** read something, but under the goal.
  - **Grey:** no reading.
  - **Dashed outline:** future days.
  - Each day also shows its page count (e.g. "20p") on wider screens, and today has a dark ring.
- **Symbols as well as colours,** so the calendar still works for colour-blind readers. Each day also has a label for screen readers ("2026-10-27: 10 pages, goal hit").
- **Previous / Next month** buttons, plus "This month" when you've moved away. A summary line says: "You hit your 10-page goal on 2 of 31 days so far."
- A legend and a "Log today's reading" button.
- `src/lib/calendar.ts` holds the month grid and day-status helpers.

## How it was tested (locally, with the test account)
- October 2026: Oct 20 (8 pages) is yellow with •; Oct 27 (10) and Oct 31 (20) are green with ✓; Oct 31 has the "today" ring; every other day is grey. The summary says 2 of 31 days.
- November 2026: all days dashed as upcoming.
- February 2026: 28 days.
- Phone width (375px): fits, with no sideways scrolling. The nav wraps onto two lines.

## Bugs caught along the way
- **Short months would have crashed.** The first version fetched sessions "up to the 31st". February has no 31st, so Postgres would reject `2026-02-31` as an invalid date. The agent spotted this before testing and changed it to "before the 1st of next month".
- **The squares were huge on a wide screen.** The first screenshot showed each day as a giant square across the whole page. The calendar's width is now capped.
- **Awkward wording for future months:** "You hit your goal on 0 of 0 days so far". Future months now say "This month hasn't started yet."

## Plan vs. reality notes
- **The plan said "a pattern or colors".** The result is colour plus a symbol (✓ / •), not a texture pattern.
- **"Today" comes from the server's clock (UTC).** Late in the evening in California, the calendar may already think it's tomorrow. This is the same timezone gap noted earlier.
