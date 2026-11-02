import type { FundSearchResult, IsoDate } from "@/lib/nav/types";
import type { SetupField, SipRequest } from "@/lib/setup/rules";
import type { DailyPoint, Facts, Setback, Snapshot } from "@/lib/sip";

/** What `GET /api/funds?q=` answers. */
export type FundsResponse = { funds: FundSearchResult[] };

/** What `POST /api/sip` answers when it works. Every number was worked out in code from AMFI NAVs. */
export type SipResponse = {
  /** The day we looked from, in India. */
  asOf: IsoDate;
  /** The last NAV date of the person's fund. */
  dataThrough: IsoDate;
  fund: FundSearchResult;
  request: SipRequest;
  /** One per finished month, from month 1. The replay walks these. */
  snapshots: Snapshot[];
  /** The first setback in months 4 to 12, or null. */
  setback: Setback | null;
  /** The numbers the helper card may use. They describe the setback month, or else the last finished month. */
  facts: Facts | null;
  /** Value and invested on every fund NAV date, from the first instalment to `asOf`. This is the chart. */
  series: DailyPoint[];
};

/** Why a call failed. `load` means the price service was down: show the loadError text. */
export type ApiError =
  | { error: "load" }
  | { error: "not-found" }
  | { error: "fund-too-new" }
  | { error: "bad-input"; fields: SetupField[] };
