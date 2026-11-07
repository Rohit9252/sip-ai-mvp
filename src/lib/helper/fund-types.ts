import { fundTypeCopy, fundTypeGeneral, FUND_TYPE_IDS } from "@/lib/copy/fund-types";
import type { FundTypeId } from "@/lib/copy/fund-types";
import { t } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";

/**
 * Fund-type basics (version 2): small cap, mid cap, large cap and hybrid. A question is a basics question only when
 * it names a type and asks what it is (the cues below). "Is my fund a large cap fund?" is not: it asks about the
 * person's own fund. Advice questions are caught before this runs, so "best small cap fund" never reaches it.
 * Code writes the answer (src/lib/copy/fund-types.ts): no AI, no pick.
 */

const TYPE_PATTERNS: Record<FundTypeId, RegExp> = {
  small: /small[\s-]?cap|स्मॉल[\s-]*कैप|स्माल[\s-]*कैप/i,
  mid: /mid[\s-]?cap|मिड[\s-]*कैप/i,
  large: /large[\s-]?cap|लार्ज[\s-]*कैप/i,
  flexi: /flexi[\s-]?cap|फ्लेक्सी[\s-]*कैप/i,
  hybrid: /hybrid|हाइब्रिड|हायब्रिड/i,
};

/** The question asks what a type is, or how two differ. */
const ASKS_WHAT_IT_IS: RegExp[] = [
  /\b(what|what's|whats|meaning|mean|means|define|explain|difference|differ|differs|about|vs|versus)\b/i,
  /\b(kya|matlab|fark|antar|kise|kehte|samjha\w*|bata\w*)\b/i,
  /क्या|मतलब|अंतर|फ़र्क|फर्क|किसे|कहते|समझा|बता|बारे/,
];

/** The question is about the person's own fund ("my flexi cap fund"), so a definition would not answer it. */
const ABOUT_OWN_FUND = /\b(my|mera|meri|mere)\b|मेरा|मेरी|मेरे/i;

/** The question asks what something is or means, and is not about the person's own fund. */
export function asksWhatItIs(question: string): boolean {
  return !ABOUT_OWN_FUND.test(question) && ASKS_WHAT_IT_IS.some((p) => p.test(question));
}

/** The fund types a question names, in the order it names them. Empty when it is not asking what a type is. */
export function detectFundTypes(question: string): FundTypeId[] {
  if (!asksWhatItIs(question)) return [];
  return FUND_TYPE_IDS.map((id) => ({ id, at: question.search(TYPE_PATTERNS[id]) }))
    .filter((hit) => hit.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((hit) => hit.id);
}

/** The order the basics are offered in, one at a time. Hybrid is last. */
export function nextFundType(id: FundTypeId): FundTypeId | null {
  const i = FUND_TYPE_IDS.indexOf(id);
  return i >= 0 && i < FUND_TYPE_IDS.length - 1 ? FUND_TYPE_IDS[i + 1] : null;
}

export type FundTypeAnswer = { id: FundTypeId; ids: FundTypeId[]; title: string; text: string; next: FundTypeId | null };

/**
 * The types a question named, all of them, in the order named (T2 asked about small, mid and large together).
 * Each is one sentence on what the name means, and the line "this explains the name, it does not say which fund
 * suits you" comes once at the end. The next basic is the first type after the last one named, or none.
 */
export function fundTypesAnswer(named: readonly FundTypeId[], lang: Lang): FundTypeAnswer {
  const ids = [...new Set(named)];
  const lastIndex = Math.max(...ids.map((id) => FUND_TYPE_IDS.indexOf(id)));
  return {
    id: ids[0],
    ids,
    title: ids.map((id) => t(fundTypeCopy.title[id], lang)).join(", "),
    text: [...ids.map((id) => t(fundTypeCopy.body[id], lang)), t(fundTypeGeneral, lang)].join("\n\n"),
    next: lastIndex < FUND_TYPE_IDS.length - 1 ? FUND_TYPE_IDS[lastIndex + 1] : null,
  };
}

/** One type, in the person's language. */
export function fundTypeAnswer(id: FundTypeId, lang: Lang): FundTypeAnswer {
  return fundTypesAnswer([id], lang);
}

export { FUND_TYPE_IDS };
export type { FundTypeId };
