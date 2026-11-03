import type { IsoDate } from "@/lib/nav/types";

/** Most equity funds charge this on units withdrawn within a year. The fund's own page has the exact rule. */
export const EXIT_LOAD_RATE = 0.01;
const YEAR_DAYS = 365;

export type Withdrawal = {
  /** Whole rupees the person asked for. */
  amount: number;
  /** About 1% when the oldest instalment is under a year old (so every unit is), else 0. Whole rupees. */
  exitLoad: number;
  /** What would reach the bank, before any tax. Whole rupees. */
  youGet: number;
};

function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/**
 * A withdrawal of `amount` rupees from a SIP whose first instalment was on `firstInstalment`, looked at on `onDate`.
 * Inside year 1 every unit is under a year old, so the whole amount carries the exit load. After that this is an
 * estimate that ignores the load (labelled "about" on screen, and the fund page has the exact rule).
 */
export function withdrawal(amount: number, firstInstalment: IsoDate, onDate: IsoDate): Withdrawal {
  if (!Number.isInteger(amount) || amount < 0) throw new RangeError("The amount must be a whole number of rupees.");
  const young = daysBetween(firstInstalment, onDate) < YEAR_DAYS;
  const exitLoad = young ? Math.round(amount * EXIT_LOAD_RATE) : 0;
  return { amount, exitLoad, youGet: amount - exitLoad };
}
