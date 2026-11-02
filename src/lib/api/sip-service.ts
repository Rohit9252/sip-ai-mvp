import { NavError } from "@/lib/nav/client";
import type { createNavClient } from "@/lib/nav/client";
import type { IsoDate } from "@/lib/nav/types";
import type { SipRequest } from "@/lib/setup/rules";
import { lastDayOfMonth } from "@/lib/sip/dates";
import { dailySeries, simulateSip } from "@/lib/sip";
import type { ApiError, SipResponse } from "./types";

type NavClient = ReturnType<typeof createNavClient>;

/** A failure the screens know how to explain. The route turns it into an HTTP answer. */
export class SipServiceError extends Error {
  readonly kind: ApiError["error"];

  constructor(kind: ApiError["error"], message: string) {
    super(message);
    this.name = "SipServiceError";
    this.kind = kind;
  }
}

/**
 * Runs the person's SIP on real NAVs, looking from `today`: the month-end snapshots, the setback, the facts
 * and the daily series for the chart. The request must already have passed `checkSipRequest`.
 */
export async function buildSip(
  client: Pick<NavClient, "getNavHistory" | "getMarketHistory">,
  request: SipRequest,
  today: IsoDate,
): Promise<SipResponse> {
  let fund, market;
  try {
    [fund, market] = await Promise.all([client.getNavHistory(request.schemeCode), client.getMarketHistory()]);
  } catch (error) {
    if (error instanceof NavError) {
      if (error.kind === "unavailable") throw new SipServiceError("load", error.message);
      if (error.kind === "not-found") throw new SipServiceError("not-found", error.message);
      throw new SipServiceError("bad-input", error.message);
    }
    throw error;
  }

  // A fund that had no price by the end of the start month cannot have started a SIP then.
  if (fund.navs[0].date > lastDayOfMonth(request.startMonth)) {
    throw new SipServiceError("fund-too-new", "The fund has no prices that far back.");
  }

  const input = {
    fund,
    market,
    monthlyAmount: request.monthlyAmount,
    sipDay: request.sipDay,
    startMonth: request.startMonth,
    asOf: today,
  };
  let result;
  try {
    result = simulateSip(input);
  } catch (error) {
    if (error instanceof RangeError) throw new SipServiceError("fund-too-new", error.message);
    throw error;
  }
  if (result.snapshots.length === 0) {
    throw new SipServiceError("fund-too-new", "The fund has no month-end prices for this SIP.");
  }

  return {
    asOf: today,
    dataThrough: fund.navs[fund.navs.length - 1].date,
    fund: { schemeCode: fund.schemeCode, schemeName: fund.schemeName },
    request,
    snapshots: result.snapshots,
    setback: result.setback,
    facts: result.facts,
    series: dailySeries(input, today),
  };
}
