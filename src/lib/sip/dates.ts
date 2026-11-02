/** Calendar helpers on "yyyy-mm-dd" and "yyyy-mm" strings. No time zones involved. */

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2025-01" plus 3 months is "2025-04". */
export function addMonths(isoMonth: string, months: number): string {
  const [year, month] = isoMonth.split("-").map(Number);
  const index = year * 12 + (month - 1) + months;
  return `${Math.floor(index / 12)}-${pad2((index % 12) + 1)}`;
}

/** The last calendar day of a month: "2025-02" gives "2025-02-28". */
export function lastDayOfMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return `${isoMonth}-${pad2(new Date(Date.UTC(year, month, 0)).getUTCDate())}`;
}

export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** How many months from one "yyyy-mm" to another (2025-01 to 2025-04 is 3). */
export function monthsBetween(fromMonth: string, toMonth: string): number {
  const [fy, fm] = fromMonth.split("-").map(Number);
  const [ty, tm] = toMonth.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}
