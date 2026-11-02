import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createNavClient } from "@/lib/nav/client";
import { SAMPLE_SIP } from "./sample";
import { simulateSip } from "./simulate";

// Real NAVs saved from mfapi (25 Jul 2025 to 10 Apr 2026). No network in tests.
const fixtureDir = join(__dirname, "..", "nav", "__fixtures__");
const fakeMfapi = (async (url: string | URL | Request) => {
  const code = String(url).split("/").pop();
  const file = code === "118955" ? "hdfc-flexi-cap-118955.json" : "uti-nifty-50-120716.json";
  return new Response(readFileSync(join(fixtureDir, file), "utf8"), { status: 200 });
}) as typeof fetch;

async function runSample() {
  const client = createNavClient({ fetch: fakeMfapi });
  const [fund, market] = await Promise.all([
    client.getNavHistory(SAMPLE_SIP.schemeCode),
    client.getMarketHistory(),
  ]);
  return simulateSip({
    fund,
    market,
    monthlyAmount: SAMPLE_SIP.monthlyAmount,
    sipDay: SAMPLE_SIP.sipDay,
    startMonth: SAMPLE_SIP.startMonth,
    asOf: "2026-04-10",
  });
}

/*
 * HAND CHECK C (real NAVs): HDFC Flexi Cap Fund Direct Growth (118955), Rs 5,000 a month, day 5, start Aug 2025.
 * Worked out with a calculator from the saved NAVs. The full table is in docs/reference/hand-checks.md.
 *
 *   instalment date  NAV         units (5000 / NAV)   units so far
 *   5 Aug 2025       2146.403    2.329479             2.329479
 *   5 Sep 2025       2183.247    2.290167             4.619646
 *   6 Oct 2025 (5th is a Sunday)  2228.744  2.243416   6.863062
 *   6 Nov 2025 (5th is a market holiday)  2245.301  2.226873  9.089935
 *   5 Dec 2025       2283.836    2.189299            11.279234
 *   5 Jan 2026       2296.880    2.176866            13.456100
 *   5 Feb 2026       2266.855    2.205699            15.661799
 *   5 Mar 2026       2210.389    2.262045            17.923844
 *
 * 31 Mar 2026: NAV 1996.490, value = 17.923844 x 1996.49 = 35,784.78 -> Rs 35,785. Invested 8 x 5,000 = 40,000.
 * Gain = 35,785 - 40,000 = -4,215. This is the first month-end below invested, in month 8.
 * Month move (27 Feb 2026 to 31 Mar 2026): fund 1996.49 / 2261.528 - 1 = -11.72%; market 156.116 / 176.0438 - 1 = -11.32%.
 * Since the start (5 Aug 2025 to 31 Mar 2026): fund 1996.49 / 2146.403 - 1 = -6.98%; market 156.116 / 171.7917 - 1 = -9.12%.
 */
describe("the sample SIP on real NAVs (hand check C)", () => {
  test("month-end values, month by month", async () => {
    const { snapshots } = await runSample();

    expect(snapshots.map((s) => [s.monthNumber, s.date, s.invested, s.value])).toEqual([
      [1, "2025-08-29", 5000, 5021],
      [2, "2025-09-30", 10000, 10130],
      [3, "2025-10-31", 15000, 15553],
      [4, "2025-11-28", 20000, 20709],
      [5, "2025-12-31", 25000, 25633],
      [6, "2026-01-30", 30000, 30192],
      [7, "2026-02-27", 35000, 35420],
      [8, "2026-03-31", 40000, 35785],
    ]);
  });

  test("the setback is in month 8: Rs 35,785 against Rs 40,000 invested", async () => {
    const { setback } = await runSample();

    expect(setback?.snapshot).toMatchObject({
      monthNumber: 8,
      date: "2026-03-31",
      instalments: 8,
      invested: 40000,
      value: 35785,
      gain: -4215,
    });
  });

  test("the facts carry the hand-checked moves", async () => {
    const { facts } = await runSample();

    expect(facts).toMatchObject({
      hasSetback: true,
      monthNumber: 8,
      monthsKept: 8,
      dateText: "31 Mar 2026",
      invested: { amount: 40000, text: "₹40,000" },
      value: { amount: 35785, text: "₹35,785" },
      gain: { amount: -4215, text: "-₹4,215", absText: "₹4,215" },
      monthMove: {
        fromText: "27 Feb 2026",
        toText: "31 Mar 2026",
        fundMove: { pct: -11.7, text: "-11.7%" },
        marketMove: { pct: -11.3, text: "-11.3%" },
      },
      sinceStartMove: {
        fromText: "5 Aug 2025",
        fundMove: { pct: -7, text: "-7.0%" },
        marketMove: { pct: -9.1, text: "-9.1%" },
      },
    });
  });

  test("the fund is a Direct Growth plan and the market is the Nifty 50 index fund", async () => {
    const { facts } = await runSample();

    expect(facts?.fund).toEqual({
      schemeCode: 118955,
      name: "HDFC Flexi Cap Fund - Direct Plan - Growth Option",
    });
    expect(facts?.market).toEqual({ schemeCode: 120716, name: "UTI Nifty 50 Index Fund - Direct Plan - Growth" });
    expect(SAMPLE_SIP.fundName).toBe(facts?.fund.name);
  });
});
