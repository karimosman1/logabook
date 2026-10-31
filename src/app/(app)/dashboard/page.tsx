import { createClient } from "@/lib/supabase/server";
import { summarize, weeklyPages } from "@/lib/stats";
import { WeeklyChart } from "./weekly-chart";

export const metadata = { title: "Dashboard · Logabook" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: sessions }, { data: books }, { data: profile }] = await Promise.all([
    supabase.from("reading_sessions").select("session_date, pages_read"),
    supabase.from("books").select("status"),
    supabase.from("users").select("daily_page_goal").eq("id", user!.id).single(),
  ]);

  const goal = profile?.daily_page_goal ?? 10;
  const stats = summarize(sessions ?? [], books ?? [], goal);
  const weeks = weeklyPages(sessions ?? [], new Date().toISOString().slice(0, 10));
  const pagesThisWeek = weeks[weeks.length - 1].pages;

  const tiles = [
    { label: "Books finished", value: stats.booksFinished },
    { label: "Avg pages per reading day", value: stats.avgPagesPerDay },
    { label: `Days you hit ${goal} pages`, value: stats.daysGoalHit },
    {
      label: "Best month",
      value: stats.bestMonth ? stats.bestMonth.label : "—",
      detail: stats.bestMonth ? `${stats.bestMonth.pages} pages` : undefined,
    },
  ];

  return (
    <>
      <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {stats.totalPages} pages across {stats.readingDays} reading day{stats.readingDays === 1 ? "" : "s"}.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-line bg-paper-raised p-4">
            <dt className="text-sm text-ink-muted">{t.label}</dt>
            <dd className="mt-1 font-serif text-3xl text-ink">{t.value}</dd>
            {t.detail && <dd className="text-sm text-ink-muted">{t.detail}</dd>}
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-xl border border-line bg-paper-raised p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-ink">Pages read per week</h2>
          <p className="text-sm text-ink-muted">This week: {pagesThisWeek} pages</p>
        </div>
        {stats.readingDays === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">Log your first reading session to see your weekly chart.</p>
        ) : (
          <div className="mt-4">
            <WeeklyChart data={weeks} />
            {/* The same numbers as a table, for screen readers */}
            <table className="sr-only">
              <caption>Pages read per week</caption>
              <thead>
                <tr>
                  <th>Week of</th>
                  <th>Pages</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((w) => (
                  <tr key={w.weekStart}>
                    <td>{w.label}</td>
                    <td>{w.pages}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
