import { fundTypeCopy, FUND_TYPE_IDS } from "@/lib/copy/fund-types";
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
  hybrid: /hybrid|हाइब्रिड|हायब्रिड/i,
};

/** The question asks what a type is, or how two differ. */
const ASKS_WHAT_IT_IS: RegExp[] = [
  /\b(what|what's|whats|meaning|mean|means|define|explain|difference|differ|differs|about|vs|versus)\b/i,
  /\b(kya|matlab|fark|antar|kise|kehte|samjha\w*|bata\w*)\b/i,
  /क्या|मतलब|अंतर|फ़र्क|फर्क|किसे|कहते|समझा|बता|बारे/,
];

/** The fund types a question names, in the order it names them. Empty when it is not asking what a type is. */
export function detectFundTypes(question: string): FundTypeId[] {
  if (!ASKS_WHAT_IT_IS.some((p) => p.test(question))) return [];
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

export type FundTypeAnswer = { id: FundTypeId; title: string; text: string; next: FundTypeId | null };

/** One type, in the person's language. If their question named another type too, that one comes next. */
export function fundTypeAnswer(id: FundTypeId, lang: Lang, named: readonly FundTypeId[] = []): FundTypeAnswer {
  const other = named.find((n) => n !== id);
  return {
    id,
    title: t(fundTypeCopy.title[id], lang),
    text: t(fundTypeCopy.body[id], lang),
    next: other ?? nextFundType(id),
  };
}

export { FUND_TYPE_IDS };
export type { FundTypeId };
