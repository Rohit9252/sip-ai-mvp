import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createNavClient, MARKET_SCHEME_CODE, NavError, NAV_CACHE_MS } from "./client";

function fixture(name: string): string {
  return readFileSync(join(__dirname, "__fixtures__", name), "utf8");
}

/** A fake network: returns the saved body for the first matching url part. Records every url asked for. */
function fakeNetwork(routes: Record<string, string>) {
  const calls: string[] = [];
  const fetchFn = async (url: string | URL | Request) => {
    const u = String(url);
    calls.push(u);
    const key = Object.keys(routes).find((k) => u.includes(k));
    if (!key) return new Response("not routed", { status: 500 });
    return new Response(routes[key], {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  return { fetchFn: fetchFn as typeof fetch, calls };
}

describe("searchFunds", () => {
  test("shows only Direct, Growth plans", async () => {
    // Real mfapi answer for "hdfc flexi cap": Direct Growth, Direct IDCW, Regular IDCW, Regular Growth.
    const net = fakeNetwork({ "/mf/search": fixture("search-hdfc-flexi-cap.json") });
    const client = createNavClient({ fetch: net.fetchFn });

    const results = await client.searchFunds("hdfc flexi cap");

    expect(results).toEqual([
      {
        schemeCode: 118955,
        schemeName: "HDFC Flexi Cap Fund - Direct Plan - Growth Option",
      },
    ]);
  });
});

describe("getNavHistory", () => {
  test("turns the mfapi answer into ISO dates, oldest first, with numeric NAVs", async () => {
    // Real mfapi answer: dates are dd-mm-yyyy, newest first, NAVs are strings.
    const net = fakeNetwork({ "/mf/118955": fixture("hdfc-flexi-cap-118955.json") });
    const client = createNavClient({ fetch: net.fetchFn });

    const series = await client.getNavHistory(118955);

    expect(series.schemeCode).toBe(118955);
    expect(series.schemeName).toBe("HDFC Flexi Cap Fund - Direct Plan - Growth Option");
    expect(series.navs).toHaveLength(173);
    expect(series.navs[0]).toEqual({ date: "2025-07-25", nav: 2159.534 });
    // Spot-check two days read straight from the saved answer (10-04-2026 -> 2162.972).
    expect(series.navs.at(-1)).toEqual({ date: "2026-04-10", nav: 2162.972 });
    expect(series.navs.find((p) => p.date === "2026-03-31")).toEqual({ date: "2026-03-31", nav: 1996.49 });
  });
});

describe("getNavHistory problems", () => {
  test("says plainly when the scheme code does not exist", async () => {
    // Real mfapi answer for a code that does not exist: HTTP 200 with empty meta and no rows.
    const net = fakeNetwork({ "/mf/999999999": fixture("unknown-scheme.json") });
    const client = createNavClient({ fetch: net.fetchFn });

    await expect(client.getNavHistory(999999999)).rejects.toMatchObject({
      name: "NavError",
      kind: "not-found",
    });
  });

  test("says plainly when the NAV service is down", async () => {
    const down = (async () => new Response("bad gateway", { status: 502 })) as typeof fetch;
    const client = createNavClient({ fetch: down });

    await expect(client.getNavHistory(118955)).rejects.toMatchObject({ kind: "unavailable" });
    await expect(client.searchFunds("hdfc")).rejects.toBeInstanceOf(NavError);
  });

  test("says plainly when the network call itself fails", async () => {
    const broken = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    const client = createNavClient({ fetch: broken });

    await expect(client.getNavHistory(118955)).rejects.toMatchObject({ kind: "unavailable" });
  });

  test("rejects a scheme code that is not a whole positive number, without calling the network", async () => {
    const net = fakeNetwork({});
    const client = createNavClient({ fetch: net.fetchFn });

    await expect(client.getNavHistory(-5)).rejects.toMatchObject({ kind: "bad-input" });
    await expect(client.getNavHistory(1.5)).rejects.toMatchObject({ kind: "bad-input" });
    expect(net.calls).toEqual([]);
  });

  test("drops rows with a zero or unreadable NAV and keeps one row per date, oldest first", async () => {
    const body = JSON.stringify({
      meta: { scheme_code: 111, scheme_name: "Test Fund - Direct Plan - Growth" },
      data: [
        { date: "03-01-2025", nav: "12.50000" },
        { date: "02-01-2025", nav: "0.00000" },
        { date: "01-01-2025", nav: "N.A." },
        { date: "31-12-2024", nav: "12.00000" },
        { date: "31-12-2024", nav: "12.00000" },
      ],
      status: "SUCCESS",
    });
    const net = fakeNetwork({ "/mf/111": body });
    const client = createNavClient({ fetch: net.fetchFn });

    const series = await client.getNavHistory(111);

    expect(series.navs).toEqual([
      { date: "2024-12-31", nav: 12 },
      { date: "2025-01-03", nav: 12.5 },
    ]);
  });
});

describe("searchFunds guards", () => {
  test("a blank or one-letter search returns nothing and does not call the network", async () => {
    const net = fakeNetwork({});
    const client = createNavClient({ fetch: net.fetchFn });

    expect(await client.searchFunds("")).toEqual([]);
    expect(await client.searchFunds("  a ")).toEqual([]);
    expect(net.calls).toEqual([]);
  });

  test("the search text is sent URL-encoded", async () => {
    const net = fakeNetwork({ "/mf/search": "[]" });
    const client = createNavClient({ fetch: net.fetchFn });

    await client.searchFunds("hdfc flexi & cap");

    expect(net.calls).toEqual(["https://api.mfapi.in/mf/search?q=hdfc%20flexi%20%26%20cap"]);
  });
});

describe("caching", () => {
  test("a second ask within 12 hours is answered from the server cache", async () => {
    const net = fakeNetwork({ "/mf/118955": fixture("hdfc-flexi-cap-118955.json") });
    let clock = 1_000_000;
    const client = createNavClient({ fetch: net.fetchFn, now: () => clock });

    const first = await client.getNavHistory(118955);
    clock += 11 * 60 * 60 * 1000; // 11 hours later
    const second = await client.getNavHistory(118955);

    expect(second).toEqual(first);
    expect(net.calls).toHaveLength(1);
  });

  test("after 12 hours it asks again", async () => {
    const net = fakeNetwork({ "/mf/118955": fixture("hdfc-flexi-cap-118955.json") });
    let clock = 1_000_000;
    const client = createNavClient({ fetch: net.fetchFn, now: () => clock });

    await client.getNavHistory(118955);
    clock += NAV_CACHE_MS + 1;
    await client.getNavHistory(118955);

    expect(NAV_CACHE_MS).toBe(12 * 60 * 60 * 1000);
    expect(net.calls).toHaveLength(2);
  });

  test("two asks at the same moment share one call", async () => {
    const net = fakeNetwork({ "/mf/118955": fixture("hdfc-flexi-cap-118955.json") });
    const client = createNavClient({ fetch: net.fetchFn });

    const [a, b] = await Promise.all([client.getNavHistory(118955), client.getNavHistory(118955)]);

    expect(a).toEqual(b);
    expect(net.calls).toHaveLength(1);
  });

  test("a failed call is not remembered: the next ask tries again", async () => {
    let attempts = 0;
    const flaky = (async () => {
      attempts += 1;
      if (attempts === 1) return new Response("oops", { status: 503 });
      return new Response(fixture("hdfc-flexi-cap-118955.json"), { status: 200 });
    }) as typeof fetch;
    const client = createNavClient({ fetch: flaky });

    await expect(client.getNavHistory(118955)).rejects.toMatchObject({ kind: "unavailable" });
    const series = await client.getNavHistory(118955);

    expect(series.schemeCode).toBe(118955);
    expect(attempts).toBe(2);
  });

  test("searches are cached too, whatever the letter case or spacing", async () => {
    const net = fakeNetwork({ "/mf/search": fixture("search-hdfc-flexi-cap.json") });
    const client = createNavClient({ fetch: net.fetchFn });

    await client.searchFunds("HDFC Flexi Cap");
    await client.searchFunds("  hdfc flexi cap ");

    expect(net.calls).toHaveLength(1);
  });
});

describe("the market", () => {
  test("is UTI Nifty 50 Index Fund Direct Growth, scheme 120716", async () => {
    const net = fakeNetwork({ "/mf/120716": fixture("uti-nifty-50-120716.json") });
    const client = createNavClient({ fetch: net.fetchFn });

    const market = await client.getMarketHistory();

    expect(MARKET_SCHEME_CODE).toBe(120716);
    expect(market.schemeCode).toBe(120716);
    expect(market.schemeName).toBe("UTI Nifty 50 Index Fund - Direct Plan - Growth");
    expect(net.calls).toEqual(["https://api.mfapi.in/mf/120716"]);
  });
});
