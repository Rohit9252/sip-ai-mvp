import { t } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { exitLoadLearn, learnCards } from "@/lib/copy/learn";
import type { LearnCard } from "@/lib/copy/learn";
import { ownFactsCopy } from "@/lib/copy/own-facts";
import type { Facts } from "@/lib/sip/facts";
import { explain } from "./explain";
import { asksWhatItIs } from "./fund-types";
import { ownFactsReply } from "./own-facts";

/**
 * Fair questions that code answers itself (eval version 3 review). The AI answered these loosely: a general
 * definition tagged as the person's numbers, an exit load of "about ₹358" called this fund's, a "why is my value below"
 * with numbers and no reason, and a comparison for one period only. Fixed text and the facts do better.
 */

/** "What is the Nifty 50?" and "what is an exit load?": a general definition from one of the learn cards. */
export function detectLearnTopic(question: string): LearnCard | null {
  if (!asksWhatItIs(question)) return null;
  if (/nifty|निफ्टी/i.test(question)) return learnCards.find((c) => c.id === "nifty") ?? null;
  if (/exit[\s-]?load|(एग्ज़िट|एग्जिट|एक्ज़िट|एक्जिट)\s*लोड/i.test(question)) return exitLoadLearn;
  return null;
}

const WHY = /\bwhy\b|\bkyun\b|\bkyon\b|\bwajah\b|क्यों|कारण|वजह/i;
const BELOW_OR_FALL = /\b(below|less|lower|fall|fell|drop|dropped|down|gira|girawat|kam|neeche|loss)\b|कम|नीचे|गिर|घट|नुकसान/i;
const FUND = /\bfund\b|फंड|फ़ंड|\bsip\b/i;
const MARKET = /\bmarket\b|nifty|मार्केट|बाज़ार|बाजार|निफ्टी/i;
const COMPARING = /\b(more|less|worse|better|against|compared|than|vs|versus|zyada|jyada|kam|se|aur|mukable|mukabla)\b|ज़्यादा|ज्यादा|कम|खराब|बेहतर|मुकाबले|से|और/i;

export type FactsTopic = "why-below" | "compare";

/** "Why is my value below what I put in?" and "did my fund fall more than the market?" */
export function detectFactsTopic(question: string): FactsTopic | null {
  if (WHY.test(question) && BELOW_OR_FALL.test(question)) return "why-below";
  if (FUND.test(question) && MARKET.test(question) && COMPARING.test(question)) return "compare";
  return null;
}

/**
 * What the facts show, from code. A comparison gives this month and since the start together, so the two cannot seem
 * to disagree. A "why is it below" starts with what was put in and what it is worth. It states no cause beyond the moves.
 */
export function factsAnswer(facts: Facts, topic: FactsTopic, lang: Lang): string {
  const parts: string[] = [];
  if (topic === "why-below") {
    parts.push(t(ownFactsCopy.totals, lang, { invested: facts.invested.text, value: facts.value.text }));
  }
  parts.push(explain(facts, "dunno", lang).reason);
  parts.push(ownFactsReply(facts, lang)[0]);
  return parts.join("\n\n");
}
