import { beforeAll, describe, expect, test } from "vitest";
import { LANGS } from "@/lib/copy/dictionary";
import { allowedNumbers, checkReply } from "@/lib/guard/reply";
import { sampleFacts } from "@/lib/testing/sample-facts";
import type { Facts } from "@/lib/sip";
import { exitLoadAbout, ownFactsReply } from "./own-facts";

let facts: Facts;
beforeAll(async () => {
  facts = await sampleFacts();
});

describe("ownFactsReply: the person's own facts after a question that asked for advice", () => {
  test("holds three parts: their fund against the market, what switching involves, what stopping does", () => {
    const parts = ownFactsReply(facts, "en");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toContain("5 Aug 2025 to 31 Mar 2026");
    expect(parts[0]).toContain("your fund fell 7.0%");
    expect(parts[0]).toContain("the whole market (Nifty 50) fell 9.1%");
    expect(parts[1]).toMatch(/switching/i);
    expect(parts[1]).toContain("exit load");
    expect(parts[2]).toMatch(/stopping/i);
    expect(parts[2]).toContain("stays");
  });

  test("the exit load is about 1% of the value, in whole rupees, and labelled 'about'", () => {
    expect(exitLoadAbout(facts)).toBe(358);
    expect(ownFactsReply(facts, "en")[1]).toContain("about ₹358");
    expect(ownFactsReply(facts, "en")[1]).toContain("₹35,785");
  });

  test("a fund that rose says 'rose'", () => {
    const rose: Facts = {
      ...facts,
      sinceStartMove: {
        ...facts.sinceStartMove,
        fundMove: { pct: 4.2, text: "4.2%", absText: "4.2%" },
        marketMove: { pct: 2.5, text: "2.5%", absText: "2.5%" },
      },
    };
    expect(ownFactsReply(rose, "en")[0]).toContain("your fund rose 4.2%");
    expect(ownFactsReply(rose, "en")[0]).toContain("(Nifty 50) rose 2.5%");
  });

  test("works in all three languages with no unfilled braces", () => {
    for (const lang of LANGS) {
      const parts = ownFactsReply(facts, lang);
      expect(parts).toHaveLength(3);
      for (const part of parts) expect(part).not.toMatch(/[{}]/);
    }
  });

  test("every number in it comes from the facts or the exit-load line, and none of it is advice or a prediction", () => {
    const allowed = allowedNumbers(facts, [exitLoadAbout(facts), 1]);
    for (const lang of LANGS) {
      const check = checkReply(ownFactsReply(facts, lang).join(" "), allowed);
      expect(check.problems.filter((p) => p !== "length"), lang).toEqual([]);
    }
  });
});
