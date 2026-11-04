// Dates are plain YYYY-MM-DD strings. "Today" follows Pacific time, where most readers are,
// so it's the same on the server (which runs in UTC) and in the browser.

export const APP_TIME_ZONE = "America/Los_Angeles"; // PST in winter, PDT in summer

// How many days back a reader can log a session they forgot
export const BACKDATE_DAYS = 7;

export function today(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: APP_TIME_ZONE }); // en-CA formats as YYYY-MM-DD
}

export function addDays(isoDate: string, n: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// The earliest date a session can be logged for
export function earliestLogDate(todayDate: string) {
  return addDays(todayDate, -BACKDATE_DAYS);
}
