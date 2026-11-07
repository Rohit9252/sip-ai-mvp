import { beforeAll, describe, expect, test } from "vitest";
import { LANGS } from "@/lib/copy/dictionary";
import { allowedNumbers, checkReply } from "@/lib/guard/reply";
import { sampleFacts } from "@/lib/testing/sample-facts";
import type { Facts } from "@/lib/sip";
import { detectFactsTopic, detectLearnTopic, factsAnswer } from "./topics";

/*
 * Added after the eval version 3 review. Three kinds of fair question were answered by the AI with a loose or
 * wrong result: "what is the Nifty 50 / an exit load" (a general definition tagged as the person's numbers, and an
 * exit load of "about ₹358" called this fund's), "why is my value below what I put in" (numbers with no reason),
 * and "did my fund fall more than the market" (one period only). Code now answers them from fixed text and the facts.
 */
let facts: Facts;
beforeAll(async () => {
  facts = await sampleFacts();
});

describe("detectLearnTopic: a plain 'what is' question about the Nifty 50 or an exit load", () => {
  test.each([
    ["What is the Nifty 50?", "nifty"],
    ["Nifty 50 kya hai?", "nifty"],
    ["निफ्टी 50 का मतलब क्या है?", "nifty"],
    ["What does exit load mean?", "exit"],
    ["Exit load ka matlab kya hota hai", "exit"],
    ["एग्ज़िट लोड क्या होता है?", "exit"],
  ])("%s", (question, id) => {
    expect(detectLearnTopic(question)?.id).toBe(id);
  });

  test.each([
    "What would the exit load be on my value?",
    "Did my fund fall more than the Nifty 50?",
    "How much exit load will I pay if I withdraw?",
    "What is NAV?",
    "Mera fund Nifty se kitna gira?",
  ])("not a definition question: %s", (question) => {
    expect(detectLearnTopic(question)).toBeNull();
  });
});

describe("detectFactsTopic", () => {
  test.each([
    "Why is my value below what I invested?",
    "Why did my value fall?",
    "Meri value kam kyun hai?",
    "मेरी value नीचे क्यों है?",
  ])("why-below: %s", (question) => expect(detectFactsTopic(question)).toBe("why-below"));

  test.each([
    "Did my fund do worse than the market?",
    "Is the market doing better than my fund?",
    "Fund aur market mein kaun zyada gira?",
    "क्या मेरा fund market से ज़्यादा गिरा?",
    "Since I started, how is my fund against the Nifty 50?",
  ])("compare: %s", (question) => expect(detectFactsTopic(question)).toBe("compare"));

  test.each([
    "Why is NAV different every day?",
    "What is the market?",
    "Did the market fall in March?",
    "How many instalments have I paid?",
  ])("neither: %s", (question) => expect(detectFactsTopic(question)).toBeNull());
});

describe("factsAnswer: what the facts show, this month and since the start", () => {
  test("a comparison holds both periods, so the two cannot seem to disagree", () => {
    const text = factsAnswer(facts, "compare", "en");
    expect(text).toContain("11.7%");
    expect(text).toContain("11.3%");
    expect(text).toContain("7.0%");
    expect(text).toContain("9.1%");
    expect(text).toContain("5 Aug 2025 to 31 Mar 2026");
  });

  test("a why-below answer starts with what was put in and what it is worth, then the moves", () => {
    const text = factsAnswer(facts, "why-below", "en");
    expect(text.startsWith("You have put in ₹40,000 and it is now worth ₹35,785.")).toBe(true);
    expect(text).toContain("11.7%");
    expect(text).toContain("7.0%");
  });

  test("in all three languages: no unfilled braces, every number from the facts, no advice, no prediction", () => {
    for (const lang of LANGS) {
      for (const topic of ["compare", "why-below"] as const) {
        const text = factsAnswer(facts, topic, lang);
        expect(text).not.toMatch(/[{}]/);
        const check = checkReply(text, allowedNumbers(facts), facts);
        expect(check.problems.filter((p) => p !== "length"), `${topic} ${lang}`).toEqual([]);
      }
    }
  });
});
