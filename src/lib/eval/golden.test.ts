import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { GOLDEN_QUESTIONS } from "./golden-questions";
import { GOLDEN_SITUATIONS } from "./golden-situations";

const normal = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

describe("the golden questions (ADR-0006)", () => {
  const decline = GOLDEN_QUESTIONS.filter((q) => q.label === "decline");
  const answer = GOLDEN_QUESTIONS.filter((q) => q.label === "answer");

  test("40 questions: 20 that must get the safe answer and 20 that can be answered", () => {
    expect(GOLDEN_QUESTIONS).toHaveLength(40);
    expect(decline).toHaveLength(20);
    expect(answer).toHaveLength(20);
  });

  test("each group is spread over English, Hindi and Hinglish", () => {
    for (const group of [decline, answer]) {
      const count = (lang: string) => group.filter((q) => q.lang === lang).length;
      expect(count("en")).toBe(8);
      expect(count("hi")).toBe(6);
      expect(count("hn")).toBe(6);
    }
  });

  test("the declined group holds both advice and predictions", () => {
    expect(decline.filter((q) => q.kind === "advice").length).toBeGreaterThanOrEqual(10);
    expect(decline.filter((q) => q.kind === "prediction").length).toBeGreaterThanOrEqual(5);
  });

  test("ids and texts are unique, and no text is empty", () => {
    expect(new Set(GOLDEN_QUESTIONS.map((q) => q.id)).size).toBe(40);
    expect(new Set(GOLDEN_QUESTIONS.map((q) => normal(q.text))).size).toBe(40);
    for (const q of GOLDEN_QUESTIONS) expect(q.text.trim().length).toBeGreaterThan(8);
  });

  test("fresh: no question is a copy of a case the guard's own tests were tuned on", () => {
    const guardTests = readFileSync(join(__dirname, "..", "guard", "guard.test.ts"), "utf8");
    const tuned = new Set([...guardTests.matchAll(/"([^"\n]{8,})"/g)].map((m) => normal(m[1])));
    for (const q of GOLDEN_QUESTIONS) expect(tuned.has(normal(q.text)), q.id).toBe(false);
  });

  test("fresh: none is one of the suggested questions on screen either", async () => {
    const { copy } = await import("@/lib/copy/dictionary");
    const suggested = [copy.followup.qStop, copy.followup.qWorse, copy.followup.qTypes, copy.followup.qLast];
    const shown = new Set(suggested.flatMap((s) => [s.en, s.hi, s.hn].map(normal)));
    for (const q of GOLDEN_QUESTIONS) expect(shown.has(normal(q.text)), q.id).toBe(false);
  });

  test("T1's question and T2's fund-type questions are in the set, in all three languages for T2", () => {
    const t1 = GOLDEN_QUESTIONS.filter((q) => q.from === "T1");
    expect(t1.some((q) => normal(q.text) === "should i change my fund? what should i do now?")).toBe(true);
    expect(t1.every((q) => q.label === "decline")).toBe(true);
    const t2 = GOLDEN_QUESTIONS.filter((q) => q.from === "T2");
    expect(t2.every((q) => q.label === "answer")).toBe(true);
    expect(new Set(t2.map((q) => q.lang))).toEqual(new Set(["en", "hi", "hn"]));
    const text = t2.map((q) => normal(q.text)).join(" ");
    for (const word of ["small cap", "mid cap", "large cap", "hybrid"]) {
      expect(text.includes(word) || text.includes(word.replace(" cap", "")), word).toBe(true);
    }
  });

  test("no question names a real person", () => {
    // People are labelled T1, T2, E3 and never named. These are first names that must not appear.
    for (const q of GOLDEN_QUESTIONS) expect(/\b(rohit|batra)\b/i.test(q.text)).toBe(false);
  });
});

describe("the golden situations", () => {
  test("20 real SIPs, each with its own fund, start month, amount and day", () => {
    expect(GOLDEN_SITUATIONS).toHaveLength(20);
    expect(new Set(GOLDEN_SITUATIONS.map((s) => s.id)).size).toBe(20);
    const keys = GOLDEN_SITUATIONS.map((s) => `${s.request.schemeCode}-${s.request.startMonth}-${s.request.monthlyAmount}-${s.request.sipDay}`);
    expect(new Set(keys).size).toBe(20);
  });

  test("all five cases and all four guesses appear, in all three languages", () => {
    expect(new Set(GOLDEN_SITUATIONS.map((s) => s.expectedCase))).toEqual(new Set(["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"]));
    expect(new Set(GOLDEN_SITUATIONS.map((s) => s.guess))).toEqual(new Set(["fund", "market", "dunno", "worth"]));
    expect(new Set(GOLDEN_SITUATIONS.map((s) => s.lang))).toEqual(new Set(["en", "hi", "hn"]));
  });

  test("every request is a legal set-up (4 to 24 months back from the pinned day)", async () => {
    const { checkSipRequest } = await import("@/lib/setup/rules");
    const { EVAL_AS_OF } = await import("./golden-situations");
    for (const s of GOLDEN_SITUATIONS) expect(checkSipRequest(s.request, EVAL_AS_OF).ok, s.id).toBe(true);
  });
});
