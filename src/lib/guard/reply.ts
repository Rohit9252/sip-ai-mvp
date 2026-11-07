import type { Facts } from "@/lib/sip/facts";

/**
 * Checks on every reply the AI writes (ADR-0001, TODO T3.1 and T3.2). A reply that fails any check is never shown:
 * the person sees the code-written template or the safe answer instead. The fixed safe answers are not checked here.
 */

export type ReplyProblem = "number" | "advice" | "prediction" | "length" | "empty" | "em-dash" | "total-as-month";
export type ReplyCheck = { ok: boolean; problems: ReplyProblem[]; badNumbers: string[] };

export const MAX_REPLY_CHARS = 480;

const ADVICE_IN_REPLY: RegExp[] = [
  /\byou should\b/i,
  /\bi (would |'d )?(recommend|suggest|advise)\b/i,
  /\b(it'?s |it is )?better to\b/i,
  /\bconsider (switching|stopping|selling|moving|redeeming|continuing|staying)\b/i,
  /\b(keep going|keep investing|stay invested|stay the course|don'?t stop|do not stop|don'?t panic|don'?t worry|do not worry|good time to|best fund|hold on)\b/i,
  /\b(chahiye|jaari rakh\w*|chalu rakh\w*|mat roko|mat rokiye|band mat|chinta mat|ghabra\w* mat|sahi samay|tension mat)\b/i,
  /(चाहिए|जारी रख|चालू रख|मत रोक|बंद मत|चिंता मत|घबरा\S* मत|सही समय|टेंशन मत)/,
];

const PREDICTION_IN_REPLY: RegExp[] = [
  /\bwill (likely |probably |soon )?(recover|rise|go up|come back|bounce|improve|grow|fall|drop|crash|double)\b/i,
  /\b(expected to|likely to|guarantee\w*|always recovers?|in the long run|long term,? (it|you|markets?)|markets? (always|eventually))\b/i,
  /\b(badhega|badhegi|badhenge|girega|giregi|girenge|wapas aayega|wapas aaega|recover hoga|recover ho jayega|guarantee|pakka)\b/i,
  /(बढ़ेगा|बढ़ेगी|बढ़ेंगे|गिरेगा|गिरेगी|गिरेंगे|वापस आएगा|recover होगा|गारंटी|पक्का)/,
];

const DEVANAGARI_DIGITS = "०१२३४५६७८९";

/** Devanagari digits become ASCII, so a number written as "११.७" is checked like "11.7". */
export function asciiDigits(text: string): string {
  return text.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
}

/** "₹35,785" becomes "35785", "11.7%" becomes "11.7", "11.70" becomes "11.7". */
function normalise(token: string): string {
  const n = Number(token.replace(/,/g, ""));
  return Number.isFinite(n) ? String(n) : token;
}

/** Every number written in a piece of text, normalised. */
export function numbersIn(text: string): string[] {
  return (asciiDigits(text).match(/\d+(?:,\d+)*(?:\.\d+)?/g) ?? []).map(normalise);
}

/**
 * The numbers a reply may use: every number in the facts (amounts, moves, months, dates, the fund's own name),
 * the gap between invested and value, "50" from Nifty 50, and any extra facts the route adds.
 */
export function allowedNumbers(facts: Facts, extra: (string | number)[] = []): Set<string> {
  const texts: string[] = [
    facts.fund.name,
    facts.market.name,
    "Nifty 50",
    facts.sip.monthlyAmount.text,
    String(facts.sip.sipDay),
    facts.sip.startMonth,
    facts.sip.startMonthText,
    String(facts.monthNumber),
    String(facts.monthsKept),
    facts.date,
    facts.dateText,
    facts.invested.text,
    facts.value.text,
    String(facts.invested.amount - facts.value.amount),
    String(Math.abs(facts.gain.amount)),
    facts.gain.absText,
  ];
  for (const move of [facts.monthMove, facts.sinceStartMove]) {
    texts.push(move.fromDate, move.fromText, move.toDate, move.toText, move.fundMove.absText, move.marketMove.absText);
  }
  texts.push(...extra.map(String));
  const allowed = new Set<string>();
  for (const text of texts) for (const n of numbersIn(text)) allowed.add(n);
  // Dates written as "2026-03-31" give "2026", "03" and "31"; "03" is normalised to "3" above.
  return allowed;
}

/** "This month" in the three languages. */
const THIS_MONTH = /this month|in the month|last month|इस महीने|महीने में|is mahine|iss mahine|is month/i;
/** A word for putting money in, in the three languages. */
const PUTTING_IN = /put in|invested|invest|paid|added|लगाए|लगाया|लगाई|निवेश|भरे|दिए|laga[yi]e?|lagaye|lagaya|bhare|diye/i;
/** Clauses end at punctuation or at a word that starts a new thought. */
const CLAUSE_END = /[.।?!;,:]|\bbut\b|\bwhile\b|\band\b|\bjabki\b|\blekin\b|\baur\b|जबकि|लेकिन|और/;

/**
 * Finds the total invested described as this month's: a clause with "this month", a word for putting money in, and
 * the total invested. The number is in the facts, so the number check passes it, but it is a wrong statement about
 * the person's money. Narrow on purpose. In month 1 the total is one instalment, so nothing is flagged.
 */
export function totalsAsThisMonth(text: string, facts: Facts): string[] {
  if (facts.invested.amount === facts.sip.monthlyAmount.amount) return [];
  const total = normalise(String(facts.invested.amount));
  // The commas inside a number ("40,000") must not end a clause.
  const flat = asciiDigits(text).replace(/(\d),(?=\d)/g, "$1");
  for (const clause of flat.split(CLAUSE_END)) {
    if (!THIS_MONTH.test(clause) || !PUTTING_IN.test(clause)) continue;
    if (numbersIn(clause).includes(total)) return [facts.invested.text];
  }
  return [];
}

export function checkReply(text: string, allowed: Set<string>, facts?: Facts): ReplyCheck {
  const problems: ReplyProblem[] = [];
  const trimmed = text.trim();
  if (!trimmed) problems.push("empty");
  if (trimmed.length > MAX_REPLY_CHARS) problems.push("length");
  if (trimmed.includes(String.fromCharCode(0x2014))) problems.push("em-dash");
  const badNumbers = numbersIn(trimmed).filter((n) => !allowed.has(n));
  if (badNumbers.length > 0) problems.push("number");
  if (facts && totalsAsThisMonth(trimmed, facts).length > 0) problems.push("total-as-month");
  if (ADVICE_IN_REPLY.some((p) => p.test(trimmed))) problems.push("advice");
  if (PREDICTION_IN_REPLY.some((p) => p.test(trimmed))) problems.push("prediction");
  return { ok: problems.length === 0, problems, badNumbers };
}
