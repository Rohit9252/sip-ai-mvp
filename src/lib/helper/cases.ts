/**
 * Which case a setback month is, and which opening line a guess gets (docs/reference/copy.md, sections 5a and 5c).
 * Pure functions: the same input always gives the same answer, and nothing here writes a word of copy.
 * The words live in src/lib/copy/dictionary.ts.
 */

/** The person's tapped guess (ADR-0002). */
export const GUESSES = ["fund", "market", "dunno", "worth"] as const;
export type Guess = (typeof GUESSES)[number];

/** What actually moved the value in the setback month. */
export const CASES = ["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"] as const;
export type Case = (typeof CASES)[number];

/**
 * "Close" means within this many percentage points. This is an assumption to tune after testing.
 * Kept in tenths of a point so the check is a whole-number comparison, not floating point.
 */
export const CLOSE_TENTHS = 15;

/**
 * Works out the case from the month's fund move and market move, as the person sees them (one decimal).
 *  - The fund rose: FUND_UP (the value is still below what was put in, or there would be no setback).
 *  - The fund fell and the market rose or stayed flat: MARKET_UP.
 *  - Both fell: SAME if within 1.5 points, FUND_MORE if the fund fell more than 1.5 points more,
 *    FUND_LESS if it fell more than 1.5 points less.
 *  - The fund was flat (0.0): FUND_LESS if the market fell, FUND_UP if the market did not.
 */
export function classifyCase(fundPct: number, marketPct: number): Case {
  if (fundPct > 0) return "FUND_UP";
  if (fundPct === 0) return marketPct < 0 ? "FUND_LESS" : "FUND_UP";
  if (marketPct >= 0) return "MARKET_UP";
  const gapTenths = Math.round((fundPct - marketPct) * 10);
  if (Math.abs(gapTenths) <= CLOSE_TENTHS) return "SAME";
  return gapTenths < 0 ? "FUND_MORE" : "FUND_LESS";
}

/**
 * A guess that does not match what moved the value: blaming the fund when the market fell with it
 * (or the fund did not fall), or blaming the market when it rose or the fund rose. "Don't know" and
 * "not worth it" are never misreads. The app records this for the "falls read correctly" metric.
 */
export function isMisread(guess: Guess, c: Case): boolean {
  if (guess === "fund") return c === "SAME" || c === "FUND_LESS" || c === "FUND_UP";
  if (guess === "market") return c === "MARKET_UP" || c === "FUND_UP";
  return false;
}

/** Names of the opening lines in the dictionary (`copy.opening`). */
export type OpeningKey =
  | "fundNotJust"
  | "partlyRight"
  | "readRight"
  | "fundDidntFall"
  | "notQuite"
  | "dunno"
  | "dunnoSecond"
  | "worth";

/** The opening line, or lines, for a guess in a case. They come before the reason. */
export function openingKeys(guess: Guess, c: Case): OpeningKey[] {
  switch (guess) {
    case "fund":
      if (c === "SAME" || c === "FUND_LESS") return ["fundNotJust"];
      if (c === "FUND_MORE") return ["partlyRight"];
      if (c === "MARKET_UP") return ["readRight"];
      return ["fundDidntFall"];
    case "market":
      if (c === "SAME" || c === "FUND_LESS") return ["readRight"];
      if (c === "FUND_MORE") return ["partlyRight"];
      return ["notQuite"];
    case "dunno":
      return c === "SAME" || c === "FUND_LESS" ? ["dunno", "dunnoSecond"] : ["dunno"];
    case "worth":
      return ["worth"];
  }
}
