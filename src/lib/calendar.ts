// Month grid helpers for the reading calendar. Dates are YYYY-MM-DD strings throughout.

export type DayStatus = "hit" | "partial" | "missed" | "future";

export function dayStatus(pages: number, goal: number, date: string, today: string): DayStatus {
  if (date > today) return "future";
  if (pages >= goal) return "hit";
  if (pages > 0) return "partial";
  return "missed";
}

// Weeks (Monday first) covering the month; days outside the month are null
export function monthGrid(month: string): (string | null)[][] {
  const [year, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7; // Monday = 0

  const cells: (string | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function shiftMonth(month: string, by: number) {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(year, m - 1 + by, 1));
  return d.toISOString().slice(0, 7);
}

export function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
