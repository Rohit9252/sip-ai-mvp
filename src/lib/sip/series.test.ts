import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createNavClient } from "@/lib/nav/client";
import type { NavSeries } from "@/lib/nav/types";
import { SAMPLE_SIP } from "./sample";
import { dailySeries } from "./series";
import { simulateSip } from "./simulate";

/** A small NAV series from [date, nav] pairs, oldest first. */
function series(schemeCode: number, schemeName: string, pairs: [string, number][]): NavSeries {
  return { schemeCode, schemeName, navs: pairs.map(([date, nav]) => ({ date, nav })) };
}

/*
 * The same made-up NAVs as HAND CHECK A in simulate.test.ts (see docs/reference/hand-checks.md).
 * Rs 1,000 a month, SIP day 5, start 2025-01. Instalments: 6 Jan, 5 Feb, 5 Mar (100 units each),
 * 7 Apr and 5 May (125 units each). Units held: 100, 200, 300, 425, 550.
 *
 * The daily series has one point per FUND NAV date, from the first instalment on:
 *   date        NAV  units held  value (units x NAV)  invested
 *   2025-01-06  10   100         1,000                1,000
 *   2025-01-31  10   100         1,000                1,000
 *   2025-02-05  10   200         2,000                2,000
 *   2025-02-28  10   200         2,000                2,000
 *   2025-03-05  10   300         3,000                3,000
 *   2025-03-31  10   300         3,000                3,000
 *   2025-04-04  10   300         3,000                3,000   (the 7 Apr instalment has not happened yet)
 *   2025-04-07   8   425         3,400                4,000
 *   2025-04-30   8   425         3,400                4,000
 *   2025-05-01   9   425         3,825                4,000   (the 5 May instalment has not happened yet)
 *   2025-05-05   8   550         4,400                5,000
 *   2025-05-30  12   550         6,600                5,000
 * The NAV of 99 on 2025-01-04 is before the first instalment, so it is not in the series.
 */
const fundA = series(900001, "Made-up Fund A - Direct Plan - Growth", [
  ["2025-01-04", 99],
  ["2025-01-06", 10],
  ["2025-01-31", 10],
  ["2025-02-05", 10],
  ["2025-02-28", 10],
  ["2025-03-05", 10],
  ["2025-03-31", 10],
  ["2025-04-04", 10],
  ["2025-04-07", 8],
  ["2025-04-30", 8],
  ["2025-05-01", 9],
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

describe("dailySeries", () => {
  test("hand check A: value and invested on every fund NAV date from the first instalment", () => {
    const points = dailySeries(sipA, "2025-05-31");

    expect(points.map((p) => [p.date, p.value, p.invested])).toEqual([
      ["2025-01-06", 1000, 1000],
      ["2025-01-31", 1000, 1000],
      ["2025-02-05", 2000, 2000],
      ["2025-02-28", 2000, 2000],
      ["2025-03-05", 3000, 3000],
      ["2025-03-31", 3000, 3000],
      ["2025-04-04", 3000, 3000],
      ["2025-04-07", 3400, 4000],
      ["2025-04-30", 3400, 4000],
      ["2025-05-01", 3825, 4000],
      ["2025-05-05", 4400, 5000],
      ["2025-05-30", 6600, 5000],
    ]);
  });

  test("stops at the given date and does not count instalments after it", () => {
    const points = dailySeries(sipA, "2025-04-30");

    expect(points[points.length - 1]).toEqual({ date: "2025-04-30", value: 3400, invested: 4000 });
    expect(points.some((p) => p.date > "2025-04-30")).toBe(false);
  });

  test("a date between two NAV dates uses the last NAV date on or before it", () => {
    // 2025-05-03 has no NAV. The series ends on 1 May, when only four instalments had been bought.
    const points = dailySeries(sipA, "2025-05-03");

    expect(points[points.length - 1]).toEqual({ date: "2025-05-01", value: 3825, invested: 4000 });
  });

  test("never goes past the as-of date, even if a later date is asked for", () => {
    const points = dailySeries({ ...sipA, asOf: "2025-04-30" }, "2025-05-31");

    expect(points[points.length - 1].date).toBe("2025-04-30");
  });

  test("is empty before the first instalment", () => {
    // The first instalment is on 6 Jan. The NAV of 4 Jan must not make a point.
    expect(dailySeries(sipA, "2025-01-05")).toEqual([]);
  });

  test("the value on a month-end date equals the month-end snapshot", () => {
    const { snapshots } = simulateSip(sipA);
    const points = dailySeries(sipA, "2025-05-31");

    for (const snapshot of snapshots) {
      const point = points.find((p) => p.date === snapshot.date);
      expect(point).toEqual({ date: snapshot.date, value: snapshot.value, invested: snapshot.invested });
    }
  });

  test("is in date order, one point per date, and the invested line never goes down", () => {
    const points = dailySeries(sipA, "2025-05-31");
    const dates = points.map((p) => p.date);

    expect(dates).toEqual([...new Set(dates)].sort());
    for (let i = 1; i < points.length; i++) {
      expect(points[i].invested).toBeGreaterThanOrEqual(points[i - 1].invested);
    }
  });

  test("hand check C (real NAVs): the sample SIP ends at 31 Mar 2026 on Rs 35,785 against Rs 40,000", async () => {
    const dir = join(__dirname, "..", "nav", "__fixtures__");
    const fakeMfapi = (async (url: string | URL | Request) => {
      const code = String(url).split("/").pop();
      const file = code === "118955" ? "hdfc-flexi-cap-118955.json" : "uti-nifty-50-120716.json";
      return new Response(readFileSync(join(dir, file), "utf8"), { status: 200 });
    }) as typeof fetch;
    const client = createNavClient({ fetch: fakeMfapi });
    const [fund, market] = await Promise.all([client.getNavHistory(SAMPLE_SIP.schemeCode), client.getMarketHistory()]);

    const points = dailySeries(
      {
        fund,
        market,
        monthlyAmount: SAMPLE_SIP.monthlyAmount,
        sipDay: SAMPLE_SIP.sipDay,
        startMonth: SAMPLE_SIP.startMonth,
        asOf: "2026-04-10",
      },
      "2026-03-31",
    );

    expect(points[0]).toMatchObject({ date: "2025-08-05", invested: 5000, value: 5000 });
    expect(points[points.length - 1]).toEqual({ date: "2026-03-31", value: 35785, invested: 40000 });
  });
});
