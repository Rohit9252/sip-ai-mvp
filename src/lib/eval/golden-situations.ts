import type { GoldenSituation } from "./types";

/**
 * The day the 20 SIPs are looked at from. It is fixed, so the same SIP always gives the same setback month.
 * The prices come live from AMFI through mfapi.in and the setback months are in the past, so they do not move.
 */
export const EVAL_AS_OF = "2026-11-07";

/**
 * The 20 real SIP situations of the golden set (ADR-0006, TODO T5.1). Real funds, real start months, real prices.
 * Each one has a setback in months 4 to 12. They were found by replaying SIPs on live prices and picked to cover all
 * five cases, all four guesses and all three languages, with no more than two SIPs from one fund. Frozen before the
 * first run. Day 5 of the month throughout. `expectedCase` is the case seen when the SIP was chosen.
 */
const sip = (schemeCode: number, startMonth: string, monthlyAmount: number) => ({ schemeCode, startMonth, monthlyAmount, sipDay: 5 });

export const GOLDEN_SITUATIONS: GoldenSituation[] = [
  { id: "s01", lang: "en", guess: "fund", fund: "HDFC Flexi Cap (the sample SIP)", request: sip(118955, "2025-08", 5000), expectedCase: "SAME" },
  { id: "s02", lang: "hi", guess: "market", fund: "DSP Midcap", request: sip(119071, "2025-10", 2000), expectedCase: "SAME" },
  { id: "s03", lang: "hn", guess: "dunno", fund: "ICICI Prudential Value", request: sip(120323, "2025-12", 5000), expectedCase: "SAME" },
  { id: "s04", lang: "en", guess: "worth", fund: "Parag Parikh Flexi Cap", request: sip(122639, "2025-09", 2000), expectedCase: "SAME" },
  { id: "s05", lang: "hn", guess: "fund", fund: "Nippon India Large Cap", request: sip(118632, "2025-08", 5000), expectedCase: "SAME" },
  { id: "s06", lang: "hi", guess: "market", fund: "Tata Digital India", request: sip(135800, "2026-06", 2000), expectedCase: "FUND_MORE" },
  { id: "s07", lang: "en", guess: "dunno", fund: "ICICI Prudential Technology", request: sip(120594, "2024-11", 2000), expectedCase: "FUND_MORE" },
  { id: "s08", lang: "hi", guess: "fund", fund: "SBI Small Cap", request: sip(125497, "2025-03", 5000), expectedCase: "FUND_MORE" },
  { id: "s09", lang: "hn", guess: "worth", fund: "Sundaram Mid Cap", request: sip(119581, "2024-11", 5000), expectedCase: "FUND_MORE" },
  { id: "s10", lang: "en", guess: "market", fund: "Parag Parikh Flexi Cap", request: sip(122639, "2026-06", 2000), expectedCase: "FUND_LESS" },
  { id: "s11", lang: "hn", guess: "fund", fund: "ICICI Prudential US Bluechip", request: sip(120186, "2025-11", 2000), expectedCase: "FUND_LESS" },
  { id: "s12", lang: "hi", guess: "dunno", fund: "SBI Small Cap", request: sip(125497, "2025-12", 5000), expectedCase: "FUND_LESS" },
  { id: "s13", lang: "en", guess: "worth", fund: "Nippon India Small Cap", request: sip(118778, "2025-12", 5000), expectedCase: "FUND_LESS" },
  { id: "s14", lang: "hn", guess: "market", fund: "Tata Digital India", request: sip(135800, "2025-03", 2000), expectedCase: "MARKET_UP" },
  { id: "s15", lang: "hi", guess: "fund", fund: "Quant Small Cap", request: sip(120828, "2026-04", 5000), expectedCase: "MARKET_UP" },
  { id: "s16", lang: "en", guess: "dunno", fund: "Nippon India Small Cap", request: sip(118778, "2026-03", 5000), expectedCase: "MARKET_UP" },
  { id: "s17", lang: "hn", guess: "worth", fund: "SBI Small Cap", request: sip(125497, "2026-07", 2000), expectedCase: "MARKET_UP" },
  { id: "s18", lang: "en", guess: "fund", fund: "UTI Flexi Cap", request: sip(120662, "2026-07", 2000), expectedCase: "FUND_UP" },
  { id: "s19", lang: "hi", guess: "market", fund: "Quant Small Cap", request: sip(120828, "2025-11", 5000), expectedCase: "FUND_UP" },
  { id: "s20", lang: "en", guess: "dunno", fund: "Axis Midcap", request: sip(120505, "2025-06", 2000), expectedCase: "FUND_UP" },
];
