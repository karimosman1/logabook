// Reading stats for the dashboard. Plain functions over plain rows, so they're easy to test.

export type SessionRow = { session_date: string; pages_read: number | null };
export type BookRow = { status: string };

export type Summary = {
  totalPages: number;
  readingDays: number;
  avgPagesPerDay: number;
  daysGoalHit: number;
  booksFinished: number;
  bestMonth: { label: string; pages: number } | null;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Several sessions on one day count as one reading day
export function pagesPerDay(sessions: SessionRow[]) {
  const days = new Map<string, number>();
  for (const s of sessions) {
    days.set(s.session_date, (days.get(s.session_date) ?? 0) + (s.pages_read ?? 0));
  }
  return days;
}

export function summarize(sessions: SessionRow[], books: BookRow[], dailyGoal = 10): Summary {
  const days = pagesPerDay(sessions);
  const totalPages = [...days.values()].reduce((sum, p) => sum + p, 0);

  const months = new Map<string, number>();
  for (const [date, pages] of days) {
    const key = date.slice(0, 7); // YYYY-MM
    months.set(key, (months.get(key) ?? 0) + pages);
  }
  let bestMonth: Summary["bestMonth"] = null;
  for (const [key, pages] of months) {
    if (!bestMonth || pages > bestMonth.pages) {
      const [year, month] = key.split("-");
      bestMonth = { label: `${MONTHS[Number(month) - 1]} ${year}`, pages };
    }
  }

  return {
    totalPages,
    readingDays: days.size,
    // Average over the days you actually read, not every day on the calendar
    avgPagesPerDay: days.size ? Math.round(totalPages / days.size) : 0,
    daysGoalHit: [...days.values()].filter((p) => p >= dailyGoal).length,
    booksFinished: books.filter((b) => b.status === "finished").length,
    bestMonth,
  };
}

// Pages per week (weeks start Monday) for the last `weeks` weeks, oldest first
export function weeklyPages(sessions: SessionRow[], today: string, weeks = 8) {
  const thisMonday = mondayOf(today);
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisMonday, (i - weeks + 1) * 7);
    return { weekStart: start, label: shortDate(start), pages: 0 };
  });

  for (const [date, pages] of pagesPerDay(sessions)) {
    const bucket = buckets.find((b) => b.weekStart === mondayOf(date));
    if (bucket) bucket.pages += pages;
  }
  return buckets;
}

function mondayOf(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const offset = (d.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(isoDate, -offset);
}

function addDays(isoDate: string, n: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function shortDate(isoDate: string) {
  const [, month, day] = isoDate.split("-");
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}
