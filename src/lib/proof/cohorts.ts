import type { IsoDate, NavSeries } from "@/lib/nav/types";
import { addMonths } from "@/lib/sip/dates";
import { SETBACK_FIRST_MONTH, SETBACK_LAST_MONTH, simulateSip } from "@/lib/sip";

/**
 * The cohort proof: the same SIP started in each of several months, replayed on real NAVs with the same engine the
 * SIP page uses. One row per start month, one cell per month of the SIP. It answers "is a fall in months 4 to 12
 * normal?" from prices, not from opinion.
 */

export type CohortCell = {
  monthNumber: number;
  /** Month-end value against the money put in so far, in percent. Below zero means under what was put in. */
  gainPct: number;
};

export type CohortRow = {
  startMonth: string;
  cells: CohortCell[];
  /** The first month in 4 to 12 that ended below what was put in, or null if there was none. */
  setbackMonth: number | null;
  /** True when all 12 months have finished by the as-of date. */
  complete: boolean;
};

export type CohortInput = {
  fund: NavSeries;
  market: NavSeries;
  firstStartMonth: string;
  starts: number;
  monthlyAmount: number;
  sipDay: number;
  asOf: IsoDate;
};

export function cohortRows(input: CohortInput): CohortRow[] {
  const rows: CohortRow[] = [];
  for (let k = 0; k < input.starts; k++) {
    const startMonth = addMonths(input.firstStartMonth, k);
    const result = simulateSip({
      fund: input.fund,
      market: input.market,
      monthlyAmount: input.monthlyAmount,
      sipDay: input.sipDay,
      startMonth,
      asOf: input.asOf,
    });
    const cells = result.snapshots
      .filter((s) => s.monthNumber <= SETBACK_LAST_MONTH && s.invested > 0)
      .map((s) => ({ monthNumber: s.monthNumber, gainPct: (s.gain / s.invested) * 100 }));
    rows.push({
      startMonth,
      cells,
      setbackMonth: result.setback ? result.setback.snapshot.monthNumber : null,
      complete: cells.length === SETBACK_LAST_MONTH,
    });
  }
  return rows;
}

/** Of the start months that reached month 4, how many fell below what was put in during months 4 to 12. */
export function cohortSummary(rows: CohortRow[]) {
  const reached = rows.filter((r) => r.cells.length >= SETBACK_FIRST_MONTH);
  const fell = reached.filter((r) => r.setbackMonth !== null);
  return { reached: reached.length, fell: fell.length, complete: rows.filter((r) => r.complete).length };
}
