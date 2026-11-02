import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createNavClient } from "@/lib/nav/client";
import { SAMPLE_SIP } from "@/lib/sip";
import { buildSip, SipServiceError } from "./sip-service";

// Real NAVs saved from mfapi (25 Jul 2025 to 10 Apr 2026). No network in tests.
const fixtureDir = join(__dirname, "..", "nav", "__fixtures__");
const fakeMfapi = (async (url: string | URL | Request) => {
  const code = String(url).split("/").pop();
  if (code === "118955" || code === "120716") {
    const file = code === "118955" ? "hdfc-flexi-cap-118955.json" : "uti-nifty-50-120716.json";
    return new Response(readFileSync(join(fixtureDir, file), "utf8"), { status: 200 });
  }
  return new Response(readFileSync(join(fixtureDir, "unknown-scheme.json"), "utf8"), { status: 200 });
}) as typeof fetch;

const sampleRequest = {
  schemeCode: SAMPLE_SIP.schemeCode,
  startMonth: SAMPLE_SIP.startMonth,
  monthlyAmount: SAMPLE_SIP.monthlyAmount,
  sipDay: SAMPLE_SIP.sipDay,
};

// The saved NAVs end on 10 Apr 2026, so the tests look from that day.
const TODAY = "2026-04-10";

describe("buildSip: the sample SIP", () => {
  test("returns the month-end snapshots, with the setback in month 8 at Rs 35,785 against Rs 40,000", async () => {
    const client = createNavClient({ fetch: fakeMfapi });

    const sip = await buildSip(client, sampleRequest, TODAY);

    expect(sip.fund).toEqual({ schemeCode: 118955, schemeName: "HDFC Flexi Cap Fund - Direct Plan - Growth Option" });
    expect(sip.snapshots).toHaveLength(8);
    expect(sip.setback?.snapshot).toMatchObject({ monthNumber: 8, date: "2026-03-31", invested: 40000, value: 35785 });
    expect(sip.facts).toMatchObject({ hasSetback: true, monthNumber: 8 });
    expect(sip.facts?.monthMove.fundMove.text).toBe("-11.7%");
    expect(sip.facts?.monthMove.marketMove.text).toBe("-11.3%");
  });

  test("returns the daily value series from the first instalment to today", async () => {
    const client = createNavClient({ fetch: fakeMfapi });

    const sip = await buildSip(client, sampleRequest, TODAY);

    expect(sip.series[0]).toMatchObject({ date: "2025-08-05", invested: 5000 });
    expect(sip.series[sip.series.length - 1].date).toBe("2026-04-10");
    const marchEnd = sip.series.find((p) => p.date === "2026-03-31");
    expect(marchEnd).toEqual({ date: "2026-03-31", value: 35785, invested: 40000 });
  });

  test("says what date the prices run to, and what day it looked from", async () => {
    const client = createNavClient({ fetch: fakeMfapi });

    const sip = await buildSip(client, sampleRequest, TODAY);

    expect(sip.asOf).toBe(TODAY);
    expect(sip.dataThrough).toBe("2026-04-10");
  });
});

describe("buildSip: when it cannot", () => {
  test("mfapi down: a 'load' error, so the screen shows the loadError text", async () => {
    const down = (async () => {
      throw new Error("network down");
    }) as typeof fetch;
    const client = createNavClient({ fetch: down });

    await expect(buildSip(client, sampleRequest, TODAY)).rejects.toMatchObject({
      name: "SipServiceError",
      kind: "load",
    });
  });

  test("mfapi answers with a server error: also a 'load' error", async () => {
    const broken = (async () => new Response("oops", { status: 502 })) as typeof fetch;
    const client = createNavClient({ fetch: broken });

    await expect(buildSip(client, sampleRequest, TODAY)).rejects.toBeInstanceOf(SipServiceError);
  });

  test("a scheme with no NAV history: 'not-found'", async () => {
    const client = createNavClient({ fetch: fakeMfapi });

    await expect(buildSip(client, { ...sampleRequest, schemeCode: 999999 }, TODAY)).rejects.toMatchObject({
      kind: "not-found",
    });
  });

  test("a fund whose prices start after the chosen start month: 'fund-too-new'", async () => {
    const client = createNavClient({ fetch: fakeMfapi });

    // The saved prices start on 25 Jul 2025, so a SIP that began in June 2025 has no prices to start from.
    await expect(buildSip(client, { ...sampleRequest, startMonth: "2025-06" }, TODAY)).rejects.toMatchObject({
      kind: "fund-too-new",
    });
  });
});
