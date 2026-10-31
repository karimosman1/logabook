import { describe, expect, it } from "vitest";
import { summarize } from "../src/lib/stats";

// Test 2 from PLAN.md: the dashboard's "average pages per day" and "days goal hit" stats
describe("dashboard stats", () => {
  it("averages 12, 8 and 10 pages to 10 per day, with the 10-page goal hit on 2 days", () => {
    // Given: a user logged sessions of 12, 8 and 10 pages on three different days this week
    const sessions = [
      { session_date: "2026-10-26", pages_read: 12 },
      { session_date: "2026-10-27", pages_read: 8 },
      { session_date: "2026-10-28", pages_read: 10 },
    ];

    // When: the dashboard works out its stats (daily goal of 10 pages)
    const stats = summarize(sessions, [], 10);

    // Then: average pages per day shows 10 and days goal hit shows 2
    expect(stats.avgPagesPerDay).toBe(10);
    expect(stats.daysGoalHit).toBe(2);
  });
});
