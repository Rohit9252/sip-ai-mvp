/** Today's date in India as "yyyy-mm-dd". The server may run in UTC, so the date is worked out for Asia/Kolkata. */
export function todayInIndia(now: Date = new Date()): string {
  // The "en-CA" locale writes dates as yyyy-mm-dd.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
