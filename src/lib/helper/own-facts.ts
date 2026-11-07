import { t } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { copy } from "@/lib/copy/dictionary";
import { ownFactsCopy } from "@/lib/copy/own-facts";
import { formatRupees } from "@/lib/sip/format";
import type { Facts } from "@/lib/sip/facts";

/**
 * The person's own facts, offered after a question that asked for advice was refused (version 2, T1's fix):
 * their fund against the market, what switching involves, what stopping does. Written by code from the facts
 * object. It states facts and never says what to do.
 */

/** About 1% of the value, the usual exit load inside a year. Worked out in code, labelled "about". */
export function exitLoadAbout(facts: Facts): number {
  return Math.round(facts.value.amount * 0.01);
}

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
    t(ownFactsCopy.switching, lang, { load: formatRupees(exitLoadAbout(facts)), value: facts.value.text }),
    t(ownFactsCopy.stopping, lang),
  ];
}
