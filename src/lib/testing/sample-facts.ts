import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createNavClient } from "@/lib/nav/client";
import { SAMPLE_SIP, simulateSip } from "@/lib/sip";
import type { Facts } from "@/lib/sip";

/**
 * For tests only: the facts of the sample SIP, worked out from the saved real NAVs (no network).
 * The saved NAVs end on 10 Apr 2026, so the SIP is looked at from that day.
 */
const fixtureDir = join(__dirname, "..", "nav", "__fixtures__");

const fakeMfapi = (async (url: string | URL | Request) => {
  const code = String(url).split("/").pop();
  const file = code === "118955" ? "hdfc-flexi-cap-118955.json" : "uti-nifty-50-120716.json";
  return new Response(readFileSync(join(fixtureDir, file), "utf8"), { status: 200 });
}) as typeof fetch;

export async function sampleFacts(): Promise<Facts> {
  const client = createNavClient({ fetch: fakeMfapi });
  const [fund, market] = await Promise.all([client.getNavHistory(SAMPLE_SIP.schemeCode), client.getMarketHistory()]);
  return simulateSip({ fund, market, ...SAMPLE_SIP, asOf: "2026-04-10" }).facts!;
}
