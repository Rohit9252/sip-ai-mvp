import type { IsoDate, NavPoint } from "@/lib/nav/types";
import { addMonths, lastDayOfMonth, monthOf, monthsBetween, pad2 } from "./dates";
import { buildFacts } from "./facts";
import type { Move, SipInput, SipResult, Snapshot } from "./types";

export type { Move, Setback, SipInput, SipResult, Snapshot } from "./types";

/** The setback is looked for in these months of the SIP (GLOSSARY, ADR-0005). Month 1 is the start month. */
export const SETBACK_FIRST_MONTH = 4;
export const SETBACK_LAST_MONTH = 12;

type Instalment = { date: IsoDate; nav: number; units: number };

/** The first NAV on or after a date, or undefined. */
function firstNavOnOrAfter(navs: NavPoint[], date: IsoDate): NavPoint | undefined {
  return navs.find((p) => p.date >= date);
}

/** The last NAV on or before a date, or undefined. */
function lastNavOnOrBefore(navs: NavPoint[], date: IsoDate): NavPoint | undefined {
  let found: NavPoint | undefined;
  for (const p of navs) {
    if (p.date > date) break;
    found = p;
  }
  return found;
}

/** One instalment a month on the SIP day, or the next date that has a NAV. Units = amount / NAV. */
function buildInstalments(input: SipInput): Instalment[] {
  const out: Instalment[] = [];
  for (let k = 0; ; k++) {
    const scheduled = `${addMonths(input.startMonth, k)}-${pad2(input.sipDay)}`;
    const point = firstNavOnOrAfter(input.fund.navs, scheduled);
    if (!point || point.date > input.asOf) break;
    out.push({ date: point.date, nav: point.nav, units: input.monthlyAmount / point.nav });
  }
  return out;
}

function isRealDate(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Refuses input the maths cannot make sense of. The UI checks these first, so this is the last guard. */
function checkInput(input: SipInput): void {
  if (!Number.isInteger(input.monthlyAmount) || input.monthlyAmount < 1) {
    throw new RangeError("The monthly amount must be a whole number of rupees, 1 or more.");
  }
  if (!Number.isInteger(input.sipDay) || input.sipDay < 1 || input.sipDay > 28) {
    throw new RangeError("The SIP day must be a whole number from 1 to 28.");
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(input.startMonth)) {
    throw new RangeError("The start month must look like 2025-08.");
  }
  if (!isRealDate(input.asOf)) {
    throw new RangeError("The as-of date must be a real date that looks like 2026-11-02.");
  }
  if (input.fund.navs.length === 0) throw new RangeError("The fund has no NAVs.");
  if (input.market.navs.length === 0) throw new RangeError("The market has no NAVs.");
}

export function simulateSip(input: SipInput): SipResult {
  checkInput(input);
  const instalments = buildInstalments(input);
  if (instalments.length > 0 && !lastNavOnOrBefore(input.market.navs, instalments[0].date)) {
    throw new RangeError("The market NAV history starts after the first instalment, so the two cannot be compared.");
  }

  function snapshotOn(date: IsoDate): Snapshot | null {
    const fundPoint = lastNavOnOrBefore(input.fund.navs, date);
    const marketPoint = fundPoint && lastNavOnOrBefore(input.market.navs, fundPoint.date);
    if (!fundPoint || !marketPoint) return null;
    const paid = instalments.filter((i) => i.date <= fundPoint.date);
    const invested = paid.length * input.monthlyAmount;
    const value = Math.round(paid.reduce((sum, i) => sum + i.units, 0) * fundPoint.nav);
    return {
      monthNumber: monthsBetween(input.startMonth, monthOf(fundPoint.date)) + 1,
      date: fundPoint.date,
      instalments: paid.length,
      invested,
      value,
      gain: value - invested,
      fundNav: fundPoint.nav,
      marketNav: marketPoint.nav,
    };
  }

  function moveBetween(fromDate: IsoDate, toDate: IsoDate): Move {
    const pct = (navs: NavPoint[]) => {
      const from = lastNavOnOrBefore(navs, fromDate)!.nav;
      const to = lastNavOnOrBefore(navs, toDate)!.nav;
      return (to / from - 1) * 100;
    };
    return { fromDate, toDate, fundPct: pct(input.fund.navs), marketPct: pct(input.market.navs) };
  }

  const snapshots: Snapshot[] = [];
  const lastFundMonth = monthOf(input.fund.navs[input.fund.navs.length - 1].date);
  for (let k = 0; ; k++) {
    const month = addMonths(input.startMonth, k);
    const monthEnd = lastDayOfMonth(month);
    // A month counts only when it has finished by asOf and the NAV data reaches it.
    if (monthEnd > input.asOf || month > lastFundMonth) break;
    const snapshot = snapshotOn(monthEnd);
    if (!snapshot) break;
    // The snapshot's month number counts from the NAV date, which is in this month.
    snapshots.push({ ...snapshot, monthNumber: k + 1 });
  }

  const latest = instalments.length > 0 ? snapshotOn(input.asOf) : null;

  const found = snapshots.find(
    (s) => s.monthNumber >= SETBACK_FIRST_MONTH && s.monthNumber <= SETBACK_LAST_MONTH && s.value < s.invested,
  );

  // The facts describe the setback month-end, or else the last finished month-end.
  const focus = found ?? snapshots[snapshots.length - 1] ?? null;
  let monthMove: Move | null = null;
  let sinceStartMove: Move | null = null;
  // A month-end before the first instalment has nothing bought yet, so it has no facts.
  if (focus && focus.instalments > 0) {
    // Month 1 has no earlier month-end, so its month move starts at the first instalment.
    const monthStart = focus.monthNumber > 1 ? snapshots[focus.monthNumber - 2].date : instalments[0].date;
    monthMove = moveBetween(monthStart, focus.date);
    sinceStartMove = moveBetween(instalments[0].date, focus.date);
  }

  const setback = found && monthMove && sinceStartMove ? { snapshot: found, monthMove, sinceStartMove } : null;
  const facts =
    focus && monthMove && sinceStartMove
      ? buildFacts({ input, focus, hasSetback: setback !== null, monthMove, sinceStartMove })
      : null;

  return { snapshots, latest, setback, facts };
}
