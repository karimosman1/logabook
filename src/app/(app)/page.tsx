import Link from "next/link";
import { dayStatus, monthGrid, monthLabel, shiftMonth, type DayStatus } from "@/lib/calendar";
import { pagesPerDay, streaks } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Calendar · Logabook" };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Colour plus a symbol, so the meaning never relies on colour alone
const STYLE: Record<DayStatus, { cell: string; mark: string; label: string }> = {
  hit: { cell: "bg-accent text-white", mark: "✓", label: "goal hit" },
  partial: { cell: "bg-partial/80 text-ink", mark: "•", label: "read, under goal" },
  missed: { cell: "bg-line/70 text-ink-muted", mark: "", label: "no reading" },
  future: { cell: "border border-dashed border-line text-ink-muted/60", mark: "", label: "upcoming" },
};

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const today = new Date().toISOString().slice(0, 10);
  const { month: requested } = await searchParams;
  const month = requested && /^\d{4}-\d{2}$/.test(requested) ? requested : today.slice(0, 7);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // All sessions, not just this month's: a streak can run across months
  const [{ data: sessions }, { data: profile }] = await Promise.all([
    supabase.from("reading_sessions").select("session_date, pages_read"),
    supabase.from("users").select("daily_page_goal").eq("id", user!.id).single(),
  ]);

  const goal = profile?.daily_page_goal ?? 10;
  const pages = pagesPerDay(sessions ?? []);
  const streak = streaks(sessions ?? [], today, goal);
  const weeks = monthGrid(month);

  const pastDays = weeks.flat().filter((d): d is string => !!d && d <= today);
  const hitDays = pastDays.filter((d) => (pages.get(d) ?? 0) >= goal).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">{monthLabel(month)}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {pastDays.length === 0
              ? "This month hasn't started yet."
              : `You hit your ${goal}-page goal on ${hitDays} of ${pastDays.length} day${pastDays.length === 1 ? "" : "s"} so far.`}
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label="Change month">
          <Link
            href={`/?month=${shiftMonth(month, -1)}`}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper-raised"
          >
            ← Previous
          </Link>
          {month !== today.slice(0, 7) && (
            <Link href="/" className="rounded-md px-3 py-1.5 text-sm text-accent underline">
              This month
            </Link>
          )}
          <Link
            href={`/?month=${shiftMonth(month, 1)}`}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper-raised"
          >
            Next →
          </Link>
        </nav>
      </div>

      <section className="mt-6 flex max-w-2xl flex-wrap gap-4" aria-label="Streaks">
        <div className="flex-1 rounded-xl border border-line bg-paper-raised p-4">
          <p className="text-sm text-ink-muted">Current streak</p>
          <p className="font-serif text-3xl text-ink">
            {streak.current} day{streak.current === 1 ? "" : "s"} {streak.current > 0 && <span aria-hidden>🔥</span>}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {streak.hitToday
              ? "Today's goal is done. See you tomorrow."
              : streak.current > 0
                ? `Read ${goal} pages today to keep it going.`
                : `Read ${goal} pages today to start a streak.`}
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-line bg-paper-raised p-4">
          <p className="text-sm text-ink-muted">Longest streak</p>
          <p className="font-serif text-3xl text-ink">
            {streak.longest} day{streak.longest === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {streak.longest > 0 && streak.current === streak.longest ? "You're on your best run!" : "Your best run so far."}
          </p>
        </div>
      </section>

      <table className="mt-6 w-full max-w-2xl table-fixed border-separate border-spacing-1.5 sm:border-spacing-2">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="pb-1 text-xs font-normal uppercase tracking-wide text-ink-muted">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                if (!date) return <td key={j} />;
                const read = pages.get(date) ?? 0;
                const status = dayStatus(read, goal, date, today);
                const style = STYLE[status];
                return (
                  <td key={date}>
                    <div
                      title={`${date}: ${read} page${read === 1 ? "" : "s"}`}
                      aria-label={`${date}: ${read} pages, ${style.label}`}
                      className={`relative flex aspect-square flex-col justify-between rounded-lg p-1.5 text-xs sm:p-2 sm:text-sm ${style.cell} ${
                        date === today ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : ""
                      }`}
                    >
                      <span>{Number(date.slice(8))}</span>
                      <span className="flex items-end justify-between">
                        <span className="hidden text-[11px] opacity-90 sm:inline">{read > 0 ? `${read}p` : ""}</span>
                        <span aria-hidden className="text-base leading-none">
                          {style.mark}
                        </span>
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted" aria-label="Legend">
        <li className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-accent text-xs text-white">✓</span>
          {goal}+ pages (goal hit)
        </li>
        <li className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-partial/80 text-xs text-ink">•</span>
          1–{goal - 1} pages
        </li>
        <li className="flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-line/70" />
          No reading
        </li>
      </ul>

      <div className="mt-8">
        <Link href="/log" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
          Log today&apos;s reading
        </Link>
      </div>
    </>
  );
}
