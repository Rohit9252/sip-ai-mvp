import { describe, expect, test } from "vitest";
import type { NavSeries } from "@/lib/nav/types";
import { FactsSchema } from "./facts";
import { simulateSip } from "./simulate";

/** A small NAV series from [date, nav] pairs, oldest first. */
function series(schemeCode: number, schemeName: string, pairs: [string, number][]): NavSeries {
  return { schemeCode, schemeName, navs: pairs.map(([date, nav]) => ({ date, nav })) };
}

/*
 * HAND CHECK A (made-up NAVs, easy sums)
 * SIP: Rs 1,000 a month, SIP day 5, start 2025-01, as of 2025-05-31.
 *
 * Instalments (first NAV date on or after the 5th):
 *   5 Jan 2025 is a Sunday, so 6 Jan 2025: NAV 10, units 1000 / 10 = 100
 *   5 Feb 2025:                             NAV 10, units 100
 *   5 Mar 2025:                             NAV 10, units 100
 *   5 Apr 2025 is a Saturday, so 7 Apr:     NAV  8, units 1000 / 8 = 125   (4 Apr has a NAV of 10: it must not be used)
 *   5 May 2025:                             NAV  8, units 125
 *
 * Month-ends (last NAV on or before the last day of the month):
 *   m1 31 Jan: 1 instalment,  invested 1,000, units 100, NAV 10 -> value 1,000, gain 0
 *   m2 28 Feb: 2 instalments, invested 2,000, units 200, NAV 10 -> value 2,000, gain 0
 *   m3 31 Mar: 3 instalments, invested 3,000, units 300, NAV 10 -> value 3,000, gain 0 (equal, not below)
 *   m4 30 Apr: 4 instalments, invested 4,000, units 425, NAV  8 -> value 3,400, gain -600   <- setback
 *   m5 30 May (31 May has no NAV): 5 instalments, invested 5,000, units 550, NAV 12 -> value 6,600, gain +1,600
 *
 * Moves for the setback month (31 Mar 2025 to 30 Apr 2025):
 *   fund   8 / 10 - 1  = -20.0%
 *   market: no NAV on 30 Apr, so the last one before it (29 Apr: 90) is used. 90 / 100 - 1 = -10.0%
 * Moves since the start (first instalment 6 Jan 2025 to 30 Apr 2025):
 *   fund   8 / 10 - 1  = -20.0%
 *   market: no NAV on 6 Jan, so 3 Jan (80) is used. 90 / 80 - 1 = +12.5%
 */
const fundA = series(900001, "Made-up Fund A - Direct Plan - Growth", [
  ["2025-01-04", 99], // a day before the SIP day, must never be used
  ["2025-01-06", 10],
  ["2025-01-31", 10],
  ["2025-02-05", 10],
  ["2025-02-28", 10],
  ["2025-03-05", 10],
  ["2025-03-31", 10],
  ["2025-04-04", 10],
  ["2025-04-07", 8],
  ["2025-04-30", 8],
  ["2025-05-01", 9], // after the April month-end, must not touch the April snapshot
  ["2025-05-05", 8],
  ["2025-05-30", 12],
]);
const marketA = series(900002, "Made-up Market", [
  ["2025-01-03", 80],
  ["2025-02-28", 85],
  ["2025-03-31", 100],
  ["2025-04-29", 90],
  ["2025-05-30", 99],
]);
const sipA = {
  fund: fundA,
  market: marketA,
  monthlyAmount: 1000,
  sipDay: 5,
  startMonth: "2025-01",
  asOf: "2025-05-31",
};

describe("month-end snapshots", () => {
  test("hand check A: invested, value and gain at each month-end", () => {
    const { snapshots } = simulateSip(sipA);

    expect(
      snapshots.map((s) => [s.monthNumber, s.date, s.instalments, s.invested, s.value, s.gain]),
    ).toEqual([
      [1, "2025-01-31", 1, 1000, 1000, 0],
      [2, "2025-02-28", 2, 2000, 2000, 0],
      [3, "2025-03-31", 3, 3000, 3000, 0],
      [4, "2025-04-30", 4, 4000, 3400, -600],
      [5, "2025-05-30", 5, 5000, 6600, 1600],
    ]);
  });

  test("months after the NAV data ends are not made up", () => {
    // The data stops on 30 May 2025. Looking from 2030 must still give only five months.
    const { snapshots } = simulateSip({ ...sipA, asOf: "2030-01-01" });

    expect(snapshots.map((s) => s.monthNumber)).toEqual([1, 2, 3, 4, 5]);
  });

  test("a month that has not finished by the as-of date is left out", () => {
    // As of 29 Apr 2025 April is still running: only January to March count.
    const { snapshots } = simulateSip({ ...sipA, asOf: "2025-04-29" });

    expect(snapshots.map((s) => s.monthNumber)).toEqual([1, 2, 3]);
  });

  test("an instalment after the as-of date is never counted", () => {
    // As of 4 Apr 2025: the April instalment (7 Apr) has not happened yet.
    const { snapshots } = simulateSip({ ...sipA, asOf: "2025-04-04" });

    expect(snapshots.at(-1)).toMatchObject({ monthNumber: 3, instalments: 3, invested: 3000 });
  });
});

describe("setback", () => {
  test("hand check A: the first month-end in months 4 to 12 with value below invested", () => {
    const { setback } = simulateSip(sipA);

    expect(setback).not.toBeNull();
    expect(setback!.snapshot).toMatchObject({
      monthNumber: 4,
      date: "2025-04-30",
      invested: 4000,
      value: 3400,
      gain: -600,
    });
  });

  test("hand check A: fund move and market move for the setback month, previous month-end to this month-end", () => {
    const { setback } = simulateSip(sipA);

    const move = setback!.monthMove;
    expect([move.fromDate, move.toDate]).toEqual(["2025-03-31", "2025-04-30"]);
    expect(move.fundPct).toBeCloseTo(-20, 9); // 8 / 10 - 1
    expect(move.marketPct).toBeCloseTo(-10, 9); // 90 / 100 - 1 (29 Apr is the last market NAV on or before 30 Apr)
  });

  test("hand check A: fund move and market move since the SIP start, first instalment to the setback month-end", () => {
    const { setback } = simulateSip(sipA);

    const move = setback!.sinceStartMove;
    expect([move.fromDate, move.toDate]).toEqual(["2025-01-06", "2025-04-30"]);
    expect(move.fundPct).toBeCloseTo(-20, 9); // 8 / 10 - 1
    expect(move.marketPct).toBeCloseTo(12.5, 9); // 90 / 80 - 1 (3 Jan is the last market NAV on or before 6 Jan)
  });
});

describe("latest", () => {
  test("is the SIP on the last NAV date on or before the as-of date, even in the middle of a month", () => {
    // As of 20 Apr 2025: four instalments are in (the 7 Apr one too). Last NAV on or before 20 Apr is 7 Apr (8).
    // Units 425, value 425 x 8 = 3,400.
    const { latest } = simulateSip({ ...sipA, asOf: "2025-04-20" });

    expect(latest).toMatchObject({
      monthNumber: 4,
      date: "2025-04-07",
      instalments: 4,
      invested: 4000,
      value: 3400,
      gain: -600,
    });
  });

  test("is null before the first instalment", () => {
    const { latest, snapshots, setback } = simulateSip({ ...sipA, asOf: "2025-01-05" });

    expect(latest).toBeNull();
    expect(snapshots).toEqual([]);
    expect(setback).toBeNull();
  });
});

/** A made-up fund with one NAV level per month, on the 5th and the 28th, from January 2025. */
function monthlyFund(code: number, name: string, levels: number[]): NavSeries {
  const pairs: [string, number][] = levels.flatMap((nav, i) => {
    const month = String((i % 12) + 1).padStart(2, "0");
    const year = 2025 + Math.floor(i / 12);
    return [
      [`${year}-${month}-05`, nav],
      [`${year}-${month}-28`, nav],
    ] as [string, number][];
  });
  return series(code, name, pairs);
}

/*
 * HAND CHECK B (made-up NAVs): the setback rule only looks at months 4 to 12.
 * SIP: Rs 1,000 a month, day 5, start 2025-01. NAV by month, month 1 to 13:
 *   10, 8, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 7
 *
 * Units: m1 1000/10 = 100, m2 1000/8 = 125, m3 100, m4 to m12 1000/11 = 90.9091 each, m13 1000/7 = 142.8571
 *   m2 : units 225,      NAV  8 -> value 1,800 vs invested 2,000 (below, but month 2 is too early)
 *   m3 : units 325,      NAV 10 -> value 3,250 vs 3,000
 *   m4 : units 415.9091, NAV 11 -> value 4,575 vs 4,000   (3,575 + 1,000)
 *   m12: units 1143.1818, NAV 11 -> value 12,575 vs 12,000 (always 575 above in months 4 to 12)
 *   m13: units 1286.0390, NAV  7 -> value 9,002 vs 13,000 (below, but month 13 is too late)
 * So there is no setback.
 */
const levelsB = [10, 8, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 7];
const flatMarket = (levels: number[]) => monthlyFund(900004, "Made-up Market", levels);

describe("the months 4 to 12 window", () => {
  const sipB = {
    fund: monthlyFund(900003, "Made-up Fund B - Direct Plan - Growth", levelsB),
    market: flatMarket(levelsB.map(() => 100)),
    monthlyAmount: 1000,
    sipDay: 5,
    startMonth: "2025-01",
    asOf: "2026-01-31",
  };

  test("hand check B: a fall below invested in month 2 or month 13 is not a setback, so there is none", () => {
    const { snapshots, setback } = simulateSip(sipB);

    expect(snapshots).toHaveLength(13);
    expect(snapshots[1]).toMatchObject({ monthNumber: 2, invested: 2000, value: 1800, gain: -200 });
    expect(snapshots[2]).toMatchObject({ monthNumber: 3, invested: 3000, value: 3250 });
    expect(snapshots[3]).toMatchObject({ monthNumber: 4, invested: 4000, value: 4575 });
    expect(snapshots[11]).toMatchObject({ monthNumber: 12, invested: 12000, value: 12575 });
    expect(snapshots[12]).toMatchObject({ monthNumber: 13, invested: 13000, value: 9002, gain: -3998 });
    expect(setback).toBeNull();
  });

  test("a fall in month 12 still counts as a setback", () => {
    // Same as B, but month 12 has a NAV of 9. Units after m12 = 325 + 8 x 90.9091 + 1000/9 = 1163.3838.
    // Value 1163.3838 x 9 = 10,470.45 -> 10,470 vs invested 12,000.
    const levels = [10, 8, 10, 11, 11, 11, 11, 11, 11, 11, 11, 9, 7];
    const { setback } = simulateSip({
      ...sipB,
      fund: monthlyFund(900003, "Made-up Fund B - Direct Plan - Growth", levels),
    });

    expect(setback?.snapshot).toMatchObject({ monthNumber: 12, invested: 12000, value: 10470, gain: -1530 });
  });

  /*
   * HAND CHECK B2 (made-up NAVs): the setback is the FIRST month-end below invested within months 4 to 12.
   * SIP: Rs 1,000 a month, day 5, start 2025-01. Fund NAV by month 1 to 6: 10, 8, 12, 11, 9, 9
   * Market NAV by month: 100, 100, 100, 100, 95, 95
   * Units: 100, 125, 83.3333, 90.9091, 111.1111, 111.1111
   *   m2: units 225,      NAV  8 -> 1,800 vs 2,000 (below, month 2 does not count)
   *   m3: units 308.3333, NAV 12 -> 3,700 vs 3,000
   *   m4: units 399.2424, NAV 11 -> 4,391.67 -> 4,392 vs 4,000
   *   m5: units 510.3535, NAV  9 -> 4,593.18 -> 4,593 vs 5,000 (below: the setback, gain -407)
   *   m6: units 621.4646, NAV  9 -> 5,593.18 -> 5,593 vs 6,000 (below again, but not the first)
   * Month move (m4 end 28 Apr to m5 end 28 May): fund 9 / 11 - 1 = -18.1818%, market 95 / 100 - 1 = -5.0%
   * Since the start (5 Jan to 28 May): fund 9 / 10 - 1 = -10.0%, market 95 / 100 - 1 = -5.0%
   */
  test("hand check B2: the first month-end in the window that is below invested is the setback", () => {
    const result = simulateSip({
      fund: monthlyFund(900005, "Made-up Fund B2 - Direct Plan - Growth", [10, 8, 12, 11, 9, 9]),
      market: flatMarket([100, 100, 100, 100, 95, 95]),
      monthlyAmount: 1000,
      sipDay: 5,
      startMonth: "2025-01",
      asOf: "2025-06-30",
    });

    expect(result.setback?.snapshot).toMatchObject({
      monthNumber: 5,
      date: "2025-05-28",
      invested: 5000,
      value: 4593,
      gain: -407,
    });
    expect(result.setback!.monthMove.fundPct).toBeCloseTo(-18.1818, 4);
    expect(result.setback!.monthMove.marketPct).toBeCloseTo(-5, 9);
    expect(result.setback!.sinceStartMove.fundPct).toBeCloseTo(-10, 9);
    expect(result.setback!.sinceStartMove.marketPct).toBeCloseTo(-5, 9);
    expect(result.snapshots[5]).toMatchObject({ monthNumber: 6, value: 5593, gain: -407 });
  });

  test("a SIP that is only 3 months old has no setback to find yet", () => {
    const result = simulateSip({
      ...sipB,
      fund: monthlyFund(900003, "Made-up Fund B - Direct Plan - Growth", [10, 8, 5]),
      market: flatMarket([100, 100, 100]),
      asOf: "2025-03-31",
    });

    expect(result.snapshots).toHaveLength(3);
    expect(result.setback).toBeNull();
  });
});

describe("an equal value is not a setback", () => {
  test("value exactly equal to invested in months 4 to 12 is not below it", () => {
    // NAV never moves, so value always equals invested.
    const flat = [10, 10, 10, 10, 10];
    const result = simulateSip({
      fund: monthlyFund(900006, "Made-up Flat Fund - Direct Plan - Growth", flat),
      market: flatMarket(flat),
      monthlyAmount: 1000,
      sipDay: 5,
      startMonth: "2025-01",
      asOf: "2025-05-31",
    });

    expect(result.snapshots.map((s) => s.gain)).toEqual([0, 0, 0, 0, 0]);
    expect(result.setback).toBeNull();
  });
});

describe("bad input is refused in plain words", () => {
  test.each([
    ["an amount of zero", { monthlyAmount: 0 }, /amount/i],
    ["an amount with paise", { monthlyAmount: 100.5 }, /amount/i],
    ["a SIP day of 0", { sipDay: 0 }, /day/i],
    ["a SIP day of 29", { sipDay: 29 }, /day/i],
    ["a start month in the wrong shape", { startMonth: "2025-1" }, /start month/i],
    ["a start month that is not a month", { startMonth: "2025-13" }, /start month/i],
    ["an as-of date in the wrong shape", { asOf: "31-05-2025" }, /as-of/i],
  ])("%s", (_name, change, message) => {
    expect(() => simulateSip({ ...sipA, ...change })).toThrow(RangeError);
    expect(() => simulateSip({ ...sipA, ...change })).toThrow(message);
  });

  test("a fund with no NAVs", () => {
    expect(() => simulateSip({ ...sipA, fund: series(1, "Empty", []) })).toThrow(/no NAV/i);
  });

  test("a market that starts after the first instalment", () => {
    const lateMarket = series(900002, "Made-up Market", [["2025-03-01", 100]]);

    expect(() => simulateSip({ ...sipA, market: lateMarket })).toThrow(/market/i);
  });
});

describe("facts", () => {
  test("hand check A: every number the AI may use, as numbers and as Indian-format words", () => {
    const { facts } = simulateSip(sipA);

    expect(facts).toEqual({
      hasSetback: true,
      fund: { schemeCode: 900001, name: "Made-up Fund A - Direct Plan - Growth" },
      market: { schemeCode: 900002, name: "Made-up Market" },
      sip: {
        monthlyAmount: { amount: 1000, text: "₹1,000" },
        sipDay: 5,
        startMonth: "2025-01",
        startMonthText: "Jan 2025",
      },
      monthNumber: 4,
      monthsKept: 4,
      date: "2025-04-30",
      dateText: "30 Apr 2025",
      invested: { amount: 4000, text: "₹4,000" },
      value: { amount: 3400, text: "₹3,400" },
      gain: { amount: -600, text: "-₹600", absText: "₹600" },
      monthMove: {
        fromDate: "2025-03-31",
        fromText: "31 Mar 2025",
        toDate: "2025-04-30",
        toText: "30 Apr 2025",
        fundMove: { pct: -20, text: "-20.0%", absText: "20.0%" },
        marketMove: { pct: -10, text: "-10.0%", absText: "10.0%" },
      },
      sinceStartMove: {
        fromDate: "2025-01-06",
        fromText: "6 Jan 2025",
        toDate: "2025-04-30",
        toText: "30 Apr 2025",
        fundMove: { pct: -20, text: "-20.0%", absText: "20.0%" },
        marketMove: { pct: 12.5, text: "12.5%", absText: "12.5%" },
      },
      source: "AMFI, via mfapi.in",
    });
  });

  test("the numbers in the facts are the rounded numbers the words show, so they always agree", () => {
    // Hand check B2: month move is 9 / 11 - 1 = -18.1818...%, shown as -18.2%.
    const { facts } = simulateSip({
      fund: monthlyFund(900005, "Made-up Fund B2 - Direct Plan - Growth", [10, 8, 12, 11, 9, 9]),
      market: flatMarket([100, 100, 100, 100, 95, 95]),
      monthlyAmount: 1000,
      sipDay: 5,
      startMonth: "2025-01",
      asOf: "2025-06-30",
    });

    expect(facts!.monthMove.fundMove).toEqual({ pct: -18.2, text: "-18.2%", absText: "18.2%" });
    expect(facts!.invested).toEqual({ amount: 5000, text: "₹5,000" });
    expect(facts!.value).toEqual({ amount: 4593, text: "₹4,593" });
    expect(facts!.gain).toEqual({ amount: -407, text: "-₹407", absText: "₹407" });
  });

  test("with no setback, the facts describe the last finished month and say so", () => {
    // Hand check B: no setback. The last finished month is month 13: invested 13,000, value 9,002.
    const { facts } = simulateSip({
      fund: monthlyFund(900003, "Made-up Fund B - Direct Plan - Growth", levelsB),
      market: flatMarket(levelsB.map(() => 100)),
      monthlyAmount: 1000,
      sipDay: 5,
      startMonth: "2025-01",
      asOf: "2026-01-31",
    });

    expect(facts).toMatchObject({
      hasSetback: false,
      monthNumber: 13,
      monthsKept: 13,
      date: "2026-01-28",
      invested: { amount: 13000, text: "₹13,000" },
      value: { amount: 9002, text: "₹9,002" },
      gain: { amount: -3998, text: "-₹3,998", absText: "₹3,998" },
    });
    // Previous month-end 28 Dec 2025 (NAV 11) to 28 Jan 2026 (NAV 7): 7 / 11 - 1 = -36.36%.
    expect(facts!.monthMove.fromDate).toBe("2025-12-28");
    expect(facts!.monthMove.fundMove.text).toBe("-36.4%");
  });

  test("in the first month the month move starts at the first instalment", () => {
    // Hand check A, as of 31 Jan 2025: one finished month, so there is no earlier month-end.
    const { facts } = simulateSip({ ...sipA, asOf: "2025-01-31" });

    expect(facts!.monthNumber).toBe(1);
    expect(facts!.monthMove.fromDate).toBe("2025-01-06");
    expect(facts!.monthMove.toDate).toBe("2025-01-31");
  });

  test("there are no facts before the first month has finished", () => {
    expect(simulateSip({ ...sipA, asOf: "2025-01-30" }).facts).toBeNull();
  });

  test("the facts always pass their own schema, and the schema refuses a missing piece", () => {
    const { facts } = simulateSip(sipA);

    expect(FactsSchema.safeParse(facts).success).toBe(true);
    const { invested, ...withoutInvested } = facts!;
    void invested;
    expect(FactsSchema.safeParse(withoutInvested).success).toBe(false);
  });
});

describe("an instalment that rolls over a month-end", () => {
  /*
   * Start 2026-02, SIP day 28, Rs 1,000. NAV is 10 on every date listed.
   * 28 Feb 2026 is a Saturday and has no NAV, so instalment 1 is bought on 2 Mar (the next date with a NAV).
   * 28 Mar 2026 is a Saturday too, so instalment 2 is bought on 31 Mar.
   *   month 1 (Feb): last NAV 27 Feb, 0 instalments -> invested 0, value 0
   *   month 2 (Mar): last NAV 31 Mar, 2 instalments -> invested 2,000, value 2,000
   */
  const fund = series(900007, "Made-up Roll Fund - Direct Plan - Growth", [
    ["2026-02-27", 10],
    ["2026-03-02", 10],
    ["2026-03-31", 10],
  ]);
  const market = series(900002, "Made-up Market", [["2026-02-27", 100], ["2026-03-31", 100]]);
  const roll = { fund, market, monthlyAmount: 1000, sipDay: 28, startMonth: "2026-02", asOf: "2026-03-31" };

  test("the instalment is bought on the next date with a NAV, which can be in the next month", () => {
    const { snapshots, facts } = simulateSip(roll);

    expect(snapshots.map((s) => [s.monthNumber, s.date, s.instalments, s.invested, s.value])).toEqual([
      [1, "2026-02-27", 0, 0, 0],
      [2, "2026-03-31", 2, 2000, 2000],
    ]);
    expect(facts).toMatchObject({ monthNumber: 2, monthsKept: 2 });
    expect(facts!.sinceStartMove.fromDate).toBe("2026-03-02");
  });

  test("with no instalment yet there are no facts, and nothing breaks", () => {
    const result = simulateSip({ ...roll, asOf: "2026-02-28" });

    expect(result.latest).toBeNull();
    expect(result.facts).toBeNull();
    expect(result.setback).toBeNull();
  });
});

describe("a finished month before the first instalment", () => {
  test("gives no facts: nothing has been bought by that month-end", () => {
    // Same roll-over SIP, as of 15 Mar 2026: February is finished with 0 instalments,
    // and the first instalment (2 Mar) is already in. March is still running.
    const fund = series(900007, "Made-up Roll Fund - Direct Plan - Growth", [
      ["2026-02-27", 10],
      ["2026-03-02", 10],
      ["2026-03-13", 10],
    ]);
    const market = series(900002, "Made-up Market", [["2026-02-27", 100], ["2026-03-13", 100]]);

    const result = simulateSip({ fund, market, monthlyAmount: 1000, sipDay: 28, startMonth: "2026-02", asOf: "2026-03-15" });

    expect(result.snapshots).toHaveLength(1);
    expect(result.snapshots[0]).toMatchObject({ instalments: 0, invested: 0, value: 0 });
    expect(result.latest).toMatchObject({ date: "2026-03-13", instalments: 1, invested: 1000, value: 1000 });
    expect(result.facts).toBeNull();
  });
});
