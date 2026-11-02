import { createNavClient } from "./client";

export { createNavClient, MARKET_SCHEME_CODE, NAV_CACHE_MS, NavError } from "./client";
export type { NavClientOptions, NavErrorKind } from "./client";
export type { FundSearchResult, IsoDate, NavPoint, NavSeries } from "./types";

/** The one client the server uses. It keeps a 12 hour cache in this server instance. */
export const navClient = createNavClient();
