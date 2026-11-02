import { z } from "zod";
import type { FundSearchResult, NavPoint, NavSeries } from "./types";

const BASE_URL = "https://api.mfapi.in/mf";

/** "The market" is UTI Nifty 50 Index Fund, Direct, Growth (ADR-0003). */
export const MARKET_SCHEME_CODE = 120716;

/** How long the server keeps an answer before asking mfapi again: 12 hours. */
export const NAV_CACHE_MS = 12 * 60 * 60 * 1000;

/** The cache never holds more than this many answers. The oldest goes first. */
const CACHE_MAX_ENTRIES = 300;

/** Why a NAV call failed, in words the app can turn into a plain message. */
export type NavErrorKind = "not-found" | "unavailable" | "bad-input";

export class NavError extends Error {
  readonly kind: NavErrorKind;

  constructor(kind: NavErrorKind, message: string) {
    super(message);
    this.name = "NavError";
    this.kind = kind;
  }
}

export type NavClientOptions = {
  /** The network. Tests pass a fake. Defaults to the global fetch. */
  fetch?: typeof fetch;
  /** The clock in milliseconds. Tests pass a fake. Defaults to Date.now. */
  now?: () => number;
};

const SearchResponse = z.array(z.object({ schemeCode: z.number().int(), schemeName: z.string() }));

const HistoryResponse = z.object({
  meta: z.object({ scheme_code: z.number().int(), scheme_name: z.string() }),
  data: z.array(z.object({ date: z.string(), nav: z.string() })),
});

/** A plan the app may show: Direct and Growth, never IDCW (payout) or Regular. */
function isDirectGrowth(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("direct") && n.includes("growth") && !/idcw|dividend|income distribution|payout|reinvest/.test(n);
}

/** mfapi writes "31-03-2026". We use "2026-03-31". Returns null if it is not that shape. */
function toIsoDate(mfapiDate: string): string | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(mfapiDate);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/**
 * Oldest first, one point per date. Rows with an unreadable date or a NAV that is
 * not above zero are dropped (a NAV of 0 is a gap in the data, not a price).
 */
function toNavPoints(rows: { date: string; nav: string }[]): NavPoint[] {
  const byDate = new Map<string, number>();
  for (const row of rows) {
    const date = toIsoDate(row.date);
    const nav = Number(row.nav);
    if (date !== null && Number.isFinite(nav) && nav > 0) byDate.set(date, nav);
  }
  return [...byDate.entries()]
    .map(([date, nav]) => ({ date, nav }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function createNavClient(options: NavClientOptions = {}) {
  const fetchFn = options.fetch ?? fetch;
  const now = options.now ?? Date.now;

  // Server cache: the answer (or the call still in flight) per url, kept for NAV_CACHE_MS.
  // It lives in this server instance. A failed call is removed so the next ask tries again.
  const cache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

  function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now()) return hit.value as Promise<T>;
    const value = load();
    cache.delete(key);
    cache.set(key, { expiresAt: now() + NAV_CACHE_MS, value });
    value.catch(() => {
      if (cache.get(key)?.value === value) cache.delete(key);
    });
    if (cache.size > CACHE_MAX_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    return value;
  }

  async function getJson(url: string): Promise<unknown> {
    let res: Response;
    try {
      res = await fetchFn(url, { headers: { accept: "application/json" } });
    } catch {
      throw new NavError("unavailable", "The NAV service could not be reached.");
    }
    if (!res.ok) {
      throw new NavError("unavailable", `The NAV service answered with status ${res.status}.`);
    }
    try {
      return await res.json();
    } catch {
      throw new NavError("unavailable", "The NAV service sent something we could not read.");
    }
  }

  /** Direct, Growth plans whose name matches. Fewer than two letters returns nothing. */
  async function searchFunds(query: string): Promise<FundSearchResult[]> {
    const q = query.trim();
    if (q.length < 2) return [];
    const url = `${BASE_URL}/search?q=${encodeURIComponent(q.toLowerCase())}`;
    return cached(url, async () => {
      const parsed = SearchResponse.safeParse(await getJson(url));
      if (!parsed.success) throw new NavError("unavailable", "The fund search sent something we could not read.");
      return parsed.data.filter((r) => isDirectGrowth(r.schemeName));
    });
  }

  /** The full NAV history of one scheme, oldest first. */
  async function getNavHistory(schemeCode: number): Promise<NavSeries> {
    if (!Number.isInteger(schemeCode) || schemeCode <= 0) {
      throw new NavError("bad-input", "A scheme code is a whole number above zero.");
    }
    const url = `${BASE_URL}/${schemeCode}`;
    return cached(url, async () => {
      const parsed = HistoryResponse.safeParse(await getJson(url));
      if (!parsed.success) throw new NavError("unavailable", "The NAV history sent something we could not read.");
      const navs = toNavPoints(parsed.data.data);
      if (navs.length === 0) {
        throw new NavError("not-found", `No NAV history for scheme ${schemeCode}.`);
      }
      return { schemeCode: parsed.data.meta.scheme_code, schemeName: parsed.data.meta.scheme_name, navs };
    });
  }

  /** The NAV history of the market (the Nifty 50 index fund). */
  function getMarketHistory(): Promise<NavSeries> {
    return getNavHistory(MARKET_SCHEME_CODE);
  }

  return { searchFunds, getNavHistory, getMarketHistory };
}
