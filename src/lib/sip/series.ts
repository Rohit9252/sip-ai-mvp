import type { IsoDate } from "@/lib/nav/types";
import { buildInstalments, checkInput } from "./simulate";
import type { SipInput } from "./types";

/** The SIP on one fund NAV date, in whole rupees. */
export type DailyPoint = {
  date: IsoDate;
  /** Units held that day x the fund NAV that day, rounded to whole rupees. */
  value: number;
  /** Instalments bought on or before that day x the monthly amount. */
  invested: number;
};

/**
 * The value and the invested amount on every fund NAV date, from the first instalment up to `toDate`
 * (or the input's as-of date, whichever is earlier). This is the line for the chart. It uses the same
 * instalments and the same rounding as the month-end snapshots, so a month-end point matches its snapshot.
 * It is empty before the first instalment.
 */
export function dailySeries(input: SipInput, toDate: IsoDate): DailyPoint[] {
  checkInput(input);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
    throw new RangeError("The end date must look like 2026-03-31.");
  }
  const end = toDate < input.asOf ? toDate : input.asOf;
  const instalments = buildInstalments({ ...input, asOf: end });
  if (instalments.length === 0) return [];

  const points: DailyPoint[] = [];
  let bought = 0;
  let units = 0;
  for (const nav of input.fund.navs) {
    if (nav.date < instalments[0].date) continue;
    if (nav.date > end) break;
    while (bought < instalments.length && instalments[bought].date <= nav.date) {
      units += instalments[bought].units;
      bought += 1;
    }
    points.push({ date: nav.date, value: Math.round(units * nav.nav), invested: bought * input.monthlyAmount });
  }
  return points;
}
