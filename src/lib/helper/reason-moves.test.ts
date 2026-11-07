import { beforeAll, describe, expect, test } from "vitest";
import { LANGS } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { formatPercent } from "@/lib/sip/format";
import type { Facts } from "@/lib/sip";
import { sampleFacts } from "@/lib/testing/sample-facts";
import { explain } from "./explain";
import { GUESSES } from "./cases";

/*
 * Found in eval version 4 (S18, S19, S20): when the fund rose, the reason left out the market's move. Every reason must
 * state both moves for the month, each with the right direction, in all three languages. These cases cover the fund
 * and the market each rising, falling or flat.
 */
let base: Facts;
beforeAll(async () => {
  base = await sampleFacts();
});

function withMoves(fundPct: number, marketPct: number): Facts {
  const pct = (n: number) => ({ pct: n, text: formatPercent(n), absText: formatPercent(Math.abs(n)) });
  return { ...base, monthMove: { ...base.monthMove, fundMove: pct(fundPct), marketMove: pct(marketPct) } };
}

const WORDS: Record<Lang, { rose: RegExp; fell: RegExp; flat: RegExp }> = {
  en: { rose: /rose/, fell: /fell/, flat: /flat/ },
  hi: { rose: /बढ़ा/, fell: /गिरा/, flat: /टिका/ },
  hn: { rose: /badha/, fell: /gira/, flat: /tika/ },
};

const PAIRS: [number, number][] = [
  [-11.7, -11.3],
  [-8.0, -3.0],
  [-1.0, -6.0],
  [-2.5, 3.6],
  [-2.5, 0],
  [0.8, -0.5],
  [0.1, 1.9],
  [0.2, 0.7],
  [2.1, -1.0],
  [0, 0],
  [0, -3.2],
  [0, 2.4],
];

/** The words next to a number: the part of the reason from the number to the next full stop. */
function phraseWith(reason: string, absText: string): string {
  const i = reason.indexOf(absText);
  expect(i, `${absText} in ${reason}`).toBeGreaterThanOrEqual(0);
  return reason.slice(Math.max(0, i - 25), i + absText.length + 25);
}

describe("every reason states the market's move and the fund's move, with the right direction", () => {
  for (const [fundPct, marketPct] of PAIRS) {
    for (const lang of LANGS) {
      test(`fund ${fundPct}, market ${marketPct}, ${lang}`, () => {
        const facts = withMoves(fundPct, marketPct);
        const reason = explain(facts, "dunno", lang).reason;
        const f = facts.monthMove.fundMove;
        const m = facts.monthMove.marketMove;
        expect(reason).toContain(m.absText);
        expect(reason).toContain(f.absText);
        const word = (pct: number) => (pct > 0 ? WORDS[lang].rose : pct < 0 ? WORDS[lang].fell : WORDS[lang].flat);
        // Market and fund are the same size in some pairs, so check the direction word near each number's first use.
        if (m.absText !== f.absText) {
          expect(word(m.pct).test(phraseWith(reason, m.absText)), `market ${reason}`).toBe(true);
          expect(word(f.pct).test(phraseWith(reason, f.absText)), `fund ${reason}`).toBe(true);
        }
        expect(reason).not.toMatch(/[{}]/);
      });
    }
  }

  test("the sample fall still reads as before", () => {
    expect(explain(base, "fund", "en").reason).toBe(
      "This month the whole market (Nifty 50) fell 11.3%. Your fund fell 11.7%, about the same as the market.",
    );
  });

  test("S19: the person tapped 'the whole market fell' and the market did fall, so the reply says it did", () => {
    const facts = withMoves(0.8, -0.5);
    const hi = explain(facts, "market", "hi");
    expect(hi.reason).toContain("0.5% गिरा");
    expect(hi.reason).toContain("0.8% बढ़ा");
    const en = explain(facts, "market", "en");
    expect(en.reason).toContain("the whole market (Nifty 50) fell 0.5%");
    expect(en.reason).toContain("your fund rose 0.8%");
  });

  test("S18: the fund rose and the market rose more, and both are stated", () => {
    const en = explain(withMoves(0.1, 1.9), "fund", "en").reason;
    expect(en).toContain("rose 1.9%");
    expect(en).toContain("rose 0.1%");
  });

  test("a flat fund is said to be flat, not to have fallen less by 0.0%", () => {
    const en = explain(withMoves(0, -3.2), "dunno", "en").reason;
    expect(en).toContain("flat");
    expect(en).not.toMatch(/fell less, 0\.0%/);
  });

  test("every guess gets a reason with both moves", () => {
    for (const g of GUESSES) {
      const reason = explain(withMoves(0.2, 0.7), g, "en").reason;
      expect(reason).toContain("0.7%");
      expect(reason).toContain("0.2%");
    }
  });
});
