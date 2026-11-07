import { copy, monthName, t } from "@/lib/copy/dictionary";
import type { Lang, TemplateValues } from "@/lib/copy/dictionary";
import { formatRupees } from "@/lib/sip/format";
import type { Facts } from "@/lib/sip/facts";
import { classifyCase, isMisread, openingKeys } from "./cases";
import type { Case, Guess } from "./cases";

/** A percentage as the facts hold it: the number, the words with its sign, and the words without. */
export type PercentFact = Facts["monthMove"]["fundMove"];

/** "3.6" becomes "+3.6%", a fall keeps its minus, and a flat move is "0.0%". */
export function signedPercent(p: PercentFact): string {
  return p.pct > 0 ? `+${p.absText}` : p.text;
}

export type Bar = {
  label: string;
  /** The move with its sign: "-11.3%" or "+3.6%". */
  text: string;
  direction: "down" | "up" | "flat";
  /** How full the bar is, 0 to 100, to one decimal. */
  widthPct: number;
};

export type Explanation = {
  case: Case;
  /** True when the guess does not match what moved the value ("falls read correctly" counts the others). */
  misread: boolean;
  /** One or two lines that come before the reason. */
  opening: string[];
  reason: string;
  bars: { market: Bar; fund: Bar };
};

/** The bars never use a scale below this many points, so a small move does not look big. */
const MIN_BAR_SCALE = 5;

function direction(pct: number): Bar["direction"] {
  return pct > 0 ? "up" : pct < 0 ? "down" : "flat";
}

function bar(label: string, p: PercentFact, scale: number): Bar {
  return {
    label,
    text: signedPercent(p),
    direction: direction(p.pct),
    widthPct: Math.round((Math.abs(p.pct) / scale) * 1000) / 10,
  };
}

/** "Your ₹40,000 is now ₹35,785. What do you think happened?" */
export function askQuestion(facts: Facts, lang: Lang): string {
  return t(copy.helper.ask, lang, { invested: facts.invested.text, value: facts.value.text });
}

/**
 * What the helper card says after a tap: the opening line (or lines) for this guess, then the reason from the
 * template for the case, then the two bars. Every number comes from the facts object (ADR-0001).
 */
export function explain(facts: Facts, guess: Guess, lang: Lang): Explanation {
  const fund = facts.monthMove.fundMove;
  const market = facts.monthMove.marketMove;
  const c = classifyCase(fund.pct, market.pct);

  const moveWords = (p: PercentFact) =>
    t(p.pct > 0 ? copy.move.rose : p.pct < 0 ? copy.move.fell : copy.move.flat, lang, { x: p.absText });
  const values: TemplateValues = {
    m: market.absText,
    f: fund.absText,
    mm: moveWords(market),
    ff: moveWords(fund),
    gap: formatRupees(facts.invested.amount - facts.value.amount),
    months: facts.monthsKept,
    invested: facts.invested.text,
    value: facts.value.text,
  };

  const scale = Math.max(MIN_BAR_SCALE, Math.abs(fund.pct), Math.abs(market.pct));
  return {
    case: c,
    misread: isMisread(guess, c),
    opening: openingKeys(guess, c).map((key) => t(copy.opening[key], lang, values)),
    reason: t(c === "FUND_LESS" && fund.pct === 0 ? copy.reason.FUND_FLAT : copy.reason[c], lang, values),
    bars: {
      market: bar(t(copy.helper.barMarket, lang), market, scale),
      fund: bar(t(copy.helper.barFund, lang), fund, scale),
    },
  };
}

/** "March 2026: market fell 11.3%, your fund fell 11.7%." It stays next to the value after "Got it". */
export function reasonLine(facts: Facts, lang: Lang): string {
  const fund = facts.monthMove.fundMove;
  const market = facts.monthMove.marketMove;
  const verb = (pct: number) => t(pct < 0 ? copy.line.fell : copy.line.rose, lang);
  return t(copy.line.reasonLine, lang, {
    month: monthName(facts.date.slice(0, 7), lang),
    m: market.absText,
    f: fund.absText,
    mVerb: verb(market.pct),
    fVerb: verb(fund.pct),
  });
}
