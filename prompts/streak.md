# Prompt log — Feature 10: Streak counter (custom feature)

## Prompt 1 (Claude Code, 2026-10-31)
> Merged, proceed

## What the agent built
- **`streaks()` in `src/lib/stats.ts`** calculates the **current streak**, the **longest streak**, and whether today's goal is already hit.
  - A day counts when its pages (all sessions added together) reach the daily goal.
  - **If today isn't logged yet, the current streak still counts up to yesterday.** The chain only breaks once a whole day passes without hitting the goal, so the app doesn't show "0" every morning.
- **Calendar:** two cards above the month grid.
  - **Current streak:** "3 days 🔥", with a nudge underneath: "Read 10 pages today to keep it going", or "Today's goal is done. See you tomorrow."
  - **Longest streak:** with "You're on your best run!" when the current streak equals it.
- **Dashboard:** the summary line now ends with "current streak 3, longest 3".
- The calendar now loads all sessions, not just the month shown, because a streak can run across months.

## How it was tested
- **Edge cases checked by running the function directly:**
  - no sessions → 0 / 0;
  - 3 days ending today → 3 / 3;
  - 3 days ending yesterday, today not logged → still 3;
  - last goal day 2 days ago → current 0, longest 3;
  - a 5-page day breaks the chain → current 2, longest 3;
  - 6 + 4 pages on one day → counts as a goal day;
  - Sep 30 → Oct 1 → a streak of 2 across the month boundary.
- **In the browser with the test account:** goal days on Oct 27, 29, 30 and 31 (Oct 28 missed). The calendar shows current streak 3, longest 3, "Today's goal is done", and "You're on your best run!". The dashboard line matches.

## Plan vs. reality notes
- **What a "streak" means wasn't defined in the plan.** The agent chose that it doesn't break until a full day is missed. Without that, every morning would show a streak of 0 until you read, which would feel discouraging.
- **"Today" is still the server's UTC date,** so near midnight Pacific time the streak can count the wrong day. This is the same timezone gap noted in earlier features.
