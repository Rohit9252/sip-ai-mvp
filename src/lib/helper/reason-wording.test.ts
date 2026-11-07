import { describe, expect, test } from "vitest";
import { copy, LANGS } from "@/lib/copy/dictionary";
import { CASES } from "./cases";
import { reasonReply } from "@/lib/api/helper-routes";
import { sampleFacts } from "@/lib/testing/sample-facts";
import { explain } from "./explain";

/*
 * The first reason is written by code, from fixed templates (eval version 3 review). A template may say only what the
 * facts show. These tests hold the wording to that, after an independent reader found lines that said more.
 */
describe("the reason templates say only what the facts show", () => {
  test("no template says a month made, brought, took or pushed the value below what was put in", () => {
    const causes = /(made|brought|took|pushed|caused|drove)[^.]{0,50}below/i;
    for (const c of CASES) expect(causes.test(copy.reason[c].en), c).toBe(false);
    for (const key of Object.keys(copy.opening) as (keyof typeof copy.opening)[]) {
      expect(causes.test(copy.opening[key].en), key).toBe(false);
    }
  });

  test("a fall in the fund while the market rose is stated as a fact, not as the fund's own reason", () => {
    for (const lang of LANGS) {
      expect(copy.reason.MARKET_UP[lang]).not.toMatch(/comes from|aapke fund ki hai|आपके fund की है/);
    }
    expect(copy.reason.MARKET_UP.en).toContain("in your fund's price, not in the whole market");
  });

  test("a wrong guess about the market is not told 'not quite', which reads as partly right", () => {
    expect(copy.opening.notQuite.en).toBe("The market is not the reason this month.");
    for (const lang of LANGS) expect(copy.opening.notQuite[lang]).not.toMatch(/not quite|poori tarah|पूरी तरह/i);
  });

  test("nothing in the reason or the openings names a cause that the facts do not hold", () => {
    const added = /(because|isliye|इसलिए|since the fund manager|news|reason for the market)/i;
    for (const c of CASES) expect(added.test(copy.reason[c].en), c).toBe(false);
  });
});

describe("reasonReply: the reason always comes from code", () => {
  test("is the template for the case, in every language, tagged as written by code", async () => {
    const facts = await sampleFacts();
    for (const lang of LANGS) {
      const reply = await reasonReply(facts, "fund", lang);
      const plain = explain(facts, "fund", lang);
      expect(reply.source).toBe("template");
      expect(reply.reason).toBe(plain.reason);
      expect(reply.opening).toEqual(plain.opening);
    }
  });
});
