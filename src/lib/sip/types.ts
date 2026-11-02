import type { IsoDate, NavSeries } from "@/lib/nav/types";
import type { Facts } from "./facts";

export type SipInput = {
  /** The person's fund. */
  fund: NavSeries;
  /** The market (the Nifty 50 index fund), over the same calendar. */
  market: NavSeries;
  /** Whole rupees per instalment. */
  monthlyAmount: number;
  /** Day of the month, 1 to 28. */
  sipDay: number;
  /** The month of the first instalment, "yyyy-mm". Month 1 of the SIP. */
  startMonth: string;
  /** The date we are looking from. Nothing after it is used. */
  asOf: IsoDate;
};

/** The SIP on one date. All money is in whole rupees. */
export type Snapshot = {
  /** Which month of the SIP the date is in. 1 is the start month. */
  monthNumber: number;
  /** A fund NAV date. For a month-end snapshot: the last fund NAV date on or before the last day of the month. */
  date: IsoDate;
  /** Instalments paid on or before `date`. */
  instalments: number;
  invested: number;
  /** Units bought so far x the fund NAV on `date`, rounded to whole rupees. */
  value: number;
  /** value - invested. Below zero means the value is under what was invested. */
  gain: number;
  fundNav: number;
  /** The market NAV on `date`, or the last one before it. */
  marketNav: number;
};

/**
 * How much the fund and the market moved between two dates, as a percentage change in NAV
 * (not in the person's value). Each NAV is the one on the date, or the last one before it.
 * The percentages are not rounded here. The facts round them to one decimal.
 */
export type Move = {
  fromDate: IsoDate;
  toDate: IsoDate;
  fundPct: number;
  marketPct: number;
};

export type Setback = {
  /** The month-end when the value was first below invested. */
  snapshot: Snapshot;
  /** Previous month-end to this month-end. */
  monthMove: Move;
  /** First instalment date to this month-end. */
  sinceStartMove: Move;
};

export type SipResult = {
  /** One per finished month, from the start month up to the last month-end on or before asOf. */
  snapshots: Snapshot[];
  /** The SIP on the last fund NAV date on or before asOf. Null before the first instalment. */
  latest: Snapshot | null;
  /** The first setback in months 4 to 12, or null if there is none. */
  setback: Setback | null;
  /**
   * Every number the AI may use (ADR-0001). Describes the setback month-end, or, when there
   * is no setback, the last finished month-end. Null until the first month has finished.
   */
  facts: Facts | null;
};
