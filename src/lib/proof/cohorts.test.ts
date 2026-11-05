import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createNavClient } from "@/lib/nav/client";
import { simulateSip } from "@/lib/sip";
import { cohortRows, cohortSummary } from "./cohorts";

// Real NAVs saved from mfapi (25 Jul 2025 to 10 Apr 2026). No network in tests.
const fixtureDir = join(__dirname, "..", "nav", "__fixtures__");
const fakeMfapi = (async (url: string | URL | Request) => {
  const code = String(url).split("/").pop();
  const file = code === "118955" ? "hdfc-flexi-cap-118955.json" : "uti-nifty-50-120716.json";
  return new Response(readFileSync(join(fixtureDir, file), "utf8"), { status: 200 });
}) as typeof fetch;

const TODAY = "2026-04-10";

async function series() {
  const client = createNavClient({ fetch: fakeMfapi });
  return Promise.all([client.getNavHistory(118955), client.getMarketHistory()]);
}

describe("cohortRows", () => {
  test("each row's setback is the SIP page's setback for that start month", async () => {
    const [fund, market] = await series();
    const rows = cohortRows({ fund, market, firstStartMonth: "2025-08", starts: 4, monthlyAmount: 5000, sipDay: 5, asOf: TODAY });

    expect(rows.map((r) => r.startMonth)).toEqual(["2025-08", "2025-09", "2025-10", "2025-11"]);
    for (const row of rows) {
      const sip = simulateSip({ fund, market, monthlyAmount: 5000, sipDay: 5, startMonth: row.startMonth, asOf: TODAY });
      expect(row.setbackMonth).toBe(sip.setback ? sip.setback.snapshot.monthNumber : null);
    }
  });

  test("the sample SIP's row falls in month 8, as on the SIP page", async () => {
    const [fund, market] = await series();
    const [row] = cohortRows({ fund, market, firstStartMonth: "2025-08", starts: 1, monthlyAmount: 5000, sipDay: 5, asOf: TODAY });

    expect(row.setbackMonth).toBe(8);
    expect(row.cells.find((c) => c.monthNumber === 8)!.gainPct).toBeLessThan(0);
    expect(row.complete).toBe(false);
  });

  test("the summary counts only start months that reached month 4", async () => {
    const [fund, market] = await series();
    const rows = cohortRows({ fund, market, firstStartMonth: "2025-08", starts: 8, monthlyAmount: 5000, sipDay: 5, asOf: TODAY });
    const summary = cohortSummary(rows);

    expect(summary.reached).toBe(rows.filter((r) => r.cells.length >= 4).length);
    expect(summary.fell).toBeLessThanOrEqual(summary.reached);
  });
});
