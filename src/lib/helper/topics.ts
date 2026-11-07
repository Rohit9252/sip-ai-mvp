import { monthName, t } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { exitLoadMeaning, learnCards } from "@/lib/copy/learn";
import type { LearnCard } from "@/lib/copy/learn";
import { ownFactsCopy } from "@/lib/copy/own-facts";
import type { Facts } from "@/lib/sip/facts";
import { isClose } from "./cases";
import { explain } from "./explain";
import { asksWhatItIs } from "./fund-types";
import { ownFactsReply } from "./own-facts";

/**
 * Fair questions that code answers itself (eval versions 3 and 4 reviews). The AI answered these loosely, or put a
 * right number to a wrong meaning: a general definition tagged as the person's numbers, an exit load called this
 * fund's, the amount invested named as what stays in the fund after stopping. Fixed text and the facts do better.
 * Each answer says what was asked first, in one plain line, and then gives the numbers.
 */

/** "What is the Nifty 50?" and "what is an exit load?": a general definition, with no figure. */
export function detectLearnTopic(question: string): LearnCard | null {
  if (!asksWhatItIs(question)) return null;
  if (/nifty|निफ्टी/i.test(question)) return learnCards.find((c) => c.id === "nifty") ?? null;
  if (/exit[\s-]?load|(एग्ज़िट|एग्जिट|एक्ज़िट|एक्जिट)\s*लोड/i.test(question)) return exitLoadMeaning;
  return null;
}

const WHY = /\bwhy\b|\bkyun\b|\bkyon\b|\bwajah\b|क्यों|कारण|वजह/i;
const BELOW_OR_FALL = /\b(below|less|lower|fall|fell|drop|dropped|down|gira|girawat|kam|neeche|loss)\b|कम|नीचे|गिर|घट|नुकसान/i;
const FUND = /\bfund\b|फंड|फ़ंड|\bsip\b/i;
const MARKET = /\bmarket\b|nifty|मार्केट|बाज़ार|बाजार|निफ्टी/i;
const COMPARING = /\b(more|less|worse|better|against|compared|than|vs|versus|zyada|jyada|kam|se|aur|mukable|mukabla)\b|ज़्यादा|ज्यादा|कम|खराब|बेहतर|मुकाबले|से|और/i;
const SINCE_START = /\b(since|start|started|first instalment|first installment|began|begin|beginning|shuru|aarambh)\b|शुरू|शुरुआत|पहली किस्त|तब से/i;

export type FactsTopic = "why-below" | "compare";
export type Period = "month" | "start";

/** "Why is my value below what I put in?" and "did my fund fall more than the market?" */
export function detectFactsTopic(question: string): FactsTopic | null {
  if (WHY.test(question) && BELOW_OR_FALL.test(question)) return "why-below";
  if (FUND.test(question) && MARKET.test(question) && COMPARING.test(question)) return "compare";
  return null;
}

/** A comparison is about the month of the fall unless the question says "since the start". */
export function detectPeriod(question: string): Period {
  return SINCE_START.test(question) ? "start" : "month";
}

/** "What happens to my money if I stop?" A word for stopping, and a word that asks what happens or where it is. */
const STOP_WORD = /\bstop\b|\bband\b|\brok\w*|बंद|रोक/i;
const WHAT_HAPPENS = /\bhappens?\b|what about|where|\bkya (hoga|hota)\b|\bkahan\b|\bkahaan\b|\brehta\b|क्या (होगा|होता)|कहाँ|कहां|रहता/i;

export function detectStopTopic(question: string): boolean {
  return STOP_WORD.test(question) && WHAT_HAPPENS.test(question);
}

/** Plain questions about the person's own amounts. */
export type NumbersTopic = "invested" | "instalments" | "gap" | "month-move";

const HOW_MANY = /\b(how many|kitn[ie]|kitni)\b|कितनी|कितने/i;
const INSTALMENT = /instal?lments?|installments?|\bkisht\w*|किस्त|इंस्टालमेंट/i;
const HOW_MUCH = /\b(how much|by how much|kitna|kitne)\b|कितना|कितने/i;
const BELOW = /\b(below|less than|short of|kam|neeche)\b|कम|नीचे/i;
const PUT_IN = /\b(invest\w*|put in|paid in|lagaya|lagaye|lagai|total|kul)\b|लगाया|लगाए|निवेश|कुल/i;
const MONTH_WORD = /this month|\bis mahine\b|इस महीने/i;
const MOVE_WORD = /\b(fall|fell|gira|girawat|rose|badha|percent|move)\b|गिरा|बढ़ा|प्रतिशत|percent|%/i;

export function detectNumbersTopic(question: string): NumbersTopic | null {
  if (HOW_MANY.test(question) && INSTALMENT.test(question)) return "instalments";
  if (HOW_MUCH.test(question) && BELOW.test(question) && PUT_IN.test(question)) return "gap";
  if (HOW_MUCH.test(question) && FUND.test(question) && MONTH_WORD.test(question) && MOVE_WORD.test(question)) return "month-move";
  if (PUT_IN.test(question) && (HOW_MUCH.test(question) || /\b(what|kya)\b|क्या/i.test(question)) && !/exit/i.test(question)) return "invested";
  return null;
}

function comparison(fundPct: number, marketPct: number): "same" | "better" | "worse" {
  if (isClose(fundPct, marketPct)) return "same";
  return fundPct > marketPct ? "better" : "worse";
}

/**
 * What the facts show, from code. A comparison starts with one plain line (about the same, better or worse) for the
 * period asked about, then that period's numbers, then the other period's, so the two cannot seem to disagree.
 * A "why is it below" starts with the reason in one line. It states no cause beyond the moves and the price paid.
 */
export function factsAnswer(facts: Facts, topic: FactsTopic, lang: Lang, period: Period = "month"): string {
  const sinceStart = ownFactsReply(facts, lang)[0];
  const thisMonth = explain(facts, "dunno", lang).reason;
  if (topic === "why-below") {
    const gap = facts.invested.amount - facts.value.amount;
    const first =
      gap > 0
        ? t(ownFactsCopy.whyBelow, lang, { invested: facts.invested.text, value: facts.value.text, gap: facts.gain.absText })
        : t(ownFactsCopy.whyNotBelow, lang, { gap: facts.gain.absText });
    return [first, thisMonth, sinceStart].join("\n\n");
  }
  const move = period === "start" ? facts.sinceStartMove : facts.monthMove;
  const verdict = comparison(move.fundMove.pct, move.marketMove.pct);
  const periodWords =
    period === "start"
      ? t(ownFactsCopy.periodStart, lang)
      : t(ownFactsCopy.periodMonth, lang, { month: monthName(facts.date.slice(0, 7), lang) });
  const line = t(verdict === "same" ? ownFactsCopy.compareSame : verdict === "better" ? ownFactsCopy.compareBetter : ownFactsCopy.compareWorse, lang, {
    period: periodWords,
  });
  return (period === "start" ? [line, sinceStart, thisMonth] : [line, thisMonth, sinceStart]).join("\n\n");
}

/**
 * What stopping does, from code (eval version 4, A12). It names the current value of the units held, never the amount
 * invested, and gives no exit load figure, because we do not know this fund's rule.
 */
export function stopAnswer(facts: Facts, lang: Lang): string {
  return t(ownFactsCopy.stopping, lang, { value: facts.value.text, date: facts.dateText });
}

/** One plain line from the facts for a question about the person's own amounts. */
export function numbersAnswer(facts: Facts, topic: NumbersTopic, lang: Lang): string {
  const base = { invested: facts.invested.text, value: facts.value.text, monthly: facts.sip.monthlyAmount.text, n: facts.monthsKept };
  switch (topic) {
    case "invested":
      return t(ownFactsCopy.investedValue, lang, base);
    case "instalments":
      return t(ownFactsCopy.instalments, lang, base);
    case "gap": {
      const gap = facts.invested.amount - facts.value.amount;
      const entry = gap > 0 ? ownFactsCopy.gapBelow : gap < 0 ? ownFactsCopy.gapAbove : ownFactsCopy.gapSame;
      return t(entry, lang, { gap: facts.gain.absText });
    }
    case "month-move":
      return explain(facts, "dunno", lang).reason;
  }
}

