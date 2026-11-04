import { describe, expect, it } from "vitest";
import { today } from "../src/lib/dates";
import { streaks } from "../src/lib/stats";
import { validateSession } from "../src/lib/validation";

describe("Pacific time", () => {
  it("is still the evening before when it's already tomorrow in UTC", () => {
    // 6:30am UTC on Nov 4 is 10:30pm PST on Nov 3
    expect(today(new Date("2026-11-04T06:30:00Z"))).toBe("2026-11-03");
  });

  it("follows daylight saving time in summer (PDT)", () => {
    // 6:30am UTC on Jul 4 is 11:30pm PDT on Jul 3
    expect(today(new Date("2026-07-04T06:30:00Z"))).toBe("2026-07-03");
  });
});

describe("logging past days", () => {
  const session = (sessionDate: string) => ({ bookId: "b", sessionDate, startPage: 1, endPage: 10, totalPages: 100 });

  it("accepts any day from today back to 7 days ago", () => {
    expect(validateSession(session("2026-11-04"), "2026-11-04")).toEqual({});
    expect(validateSession(session("2026-10-28"), "2026-11-04")).toEqual({});
  });

  it("refuses 8 days ago and tomorrow", () => {
    expect(validateSession(session("2026-10-27"), "2026-11-04").session_date).toBe(
      "You can only log reading from the last 7 days.",
    );
    expect(validateSession(session("2026-11-05"), "2026-11-04").session_date).toBe("That date is in the future.");
  });

  it("a forgotten day logged later reconnects the current streak", () => {
    const logged = [
      { session_date: "2026-11-01", pages_read: 10 },
      { session_date: "2026-11-03", pages_read: 10 },
      { session_date: "2026-11-04", pages_read: 10 },
    ];
    expect(streaks(logged, "2026-11-04").current).toBe(2); // Nov 2 is missing

    const backfilled = [...logged, { session_date: "2026-11-02", pages_read: 12 }];
    expect(streaks(backfilled, "2026-11-04").current).toBe(4);
  });
});
