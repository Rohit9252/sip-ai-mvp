import { t } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { copy } from "@/lib/copy/dictionary";
import { ownFactsCopy } from "@/lib/copy/own-facts";
import type { Facts } from "@/lib/sip/facts";

/**
 * The person's own facts, offered after a question that asked for advice was refused (version 2, T1's fix):
 * their fund against the market, what switching involves, what stopping does. Written by code from the facts
 * object. It states facts and never says what to do.
 */

/** Three short parts, one per paragraph. */
export function ownFactsReply(facts: Facts, lang: Lang): string[] {
  const fund = facts.sinceStartMove.fundMove;
  const market = facts.sinceStartMove.marketMove;
  const verb = (pct: number) => t(pct < 0 ? copy.line.fell : copy.line.rose, lang);
  return [
    t(ownFactsCopy.vsMarket, lang, {
      from: facts.sinceStartMove.fromText,
      to: facts.sinceStartMove.toText,
      f: fund.absText,
      m: market.absText,
      fVerb: verb(fund.pct),
      mVerb: verb(market.pct),
    }),
    t(ownFactsCopy.switching, lang),
    t(ownFactsCopy.stopping, lang, { value: facts.value.text, date: facts.dateText }),
  ];
}
