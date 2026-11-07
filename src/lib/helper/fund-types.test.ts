import { describe, expect, test } from "vitest";
import { LANGS } from "@/lib/copy/dictionary";
import { detectFundTypes, fundTypeAnswer, fundTypesAnswer, nextFundType } from "./fund-types";

describe("detectFundTypes: a plain question about what a fund type is", () => {
  test.each([
    ["What is a small cap fund?", ["small"]],
    ["what does mid cap mean", ["mid"]],
    ["Explain large-cap funds to me", ["large"]],
    ["What is a hybrid fund?", ["hybrid"]],
    ["What is the difference between mid cap and large cap?", ["mid", "large"]],
    ["small cap kya hota hai", ["small"]],
    ["Mid cap aur large cap mein kya fark hai?", ["mid", "large"]],
    ["hybrid fund ka matlab kya hai", ["hybrid"]],
    ["स्मॉल कैप फंड क्या होता है?", ["small"]],
    ["मिड कैप और लार्ज कैप में क्या अंतर है?", ["mid", "large"]],
    ["हाइब्रिड फंड का मतलब क्या है", ["hybrid"]],
    ["हाइब्रिड फंड किसे कहते हैं", ["hybrid"]],
    ["Small cap ko kise kehte hain?", ["small"]],
    ["What is a flexi cap fund?", ["flexi"]],
    ["Flexicap ka matlab kya hota hai", ["flexi"]],
    ["फ्लेक्सी कैप फंड क्या होता है?", ["flexi"]],
    ["What is the difference between flexi cap and large cap?", ["flexi", "large"]],
  ])("%s", (question, types) => {
    expect(detectFundTypes(question)).toEqual(types);
  });

  test.each([
    "What is NAV?",
    "Did my fund do worse than the market?",
    "Is my fund a large cap fund?",
    "Mera paisa kahan gaya?",
    "What happened to my flexi cap fund this month?",
    "Mera small cap fund kyun gira, kya bata sakte ho?",
    "मेरा हाइब्रिड फंड क्या कर रहा है?",
    "इस महीने मेरा fund कितना गिरा?",
  ])("not a fund-type question: %s", (question) => {
    expect(detectFundTypes(question)).toEqual([]);
  });
});

describe("fundTypeAnswer: general terms from AMFI and SEBI, in the person's language", () => {
  test("gives text for each type in each language", () => {
    for (const lang of LANGS) {
      for (const id of ["small", "mid", "large", "flexi", "hybrid"] as const) {
        const answer = fundTypeAnswer(id, lang);
        expect(answer.id).toBe(id);
        expect(answer.text.length).toBeGreaterThan(40);
        expect(answer.title.length).toBeGreaterThan(0);
      }
    }
  });

  test("each answer explains only what the name means: ranks for large, mid and small, 'not tied to one size' for flexi, 'a mix' for hybrid", () => {
    expect(fundTypeAnswer("large", "en").text).toContain("The name large cap means the 100 biggest listed companies by size");
    expect(fundTypeAnswer("mid", "en").text).toContain("The name mid cap means companies ranked 101 to 250 by size");
    expect(fundTypeAnswer("small", "en").text).toContain("The name small cap means companies ranked 251 and below by size");
    expect(fundTypeAnswer("flexi", "en").text).toContain("The name flexi cap means the fund is not tied to one company size");
    expect(fundTypeAnswer("hybrid", "en").text).toContain("The name hybrid means a mix of different kinds of assets, such as shares and bonds");
  });

  test("no answer says where a fund invests: no percentage and no words about buying, holdings or where money goes", () => {
    const where = /%|invest|buys|holdings|lagata|लगाता|खरीद|at least|kam se kam|कम से कम|its money|apne paise|अपने पैसे/i;
    for (const lang of LANGS) {
      for (const id of ["small", "mid", "large", "flexi", "hybrid"] as const) {
        expect(where.test(fundTypeAnswer(id, lang).text), `${id} in ${lang}`).toBe(false);
      }
      expect(where.test(fundTypesAnswer(["small", "mid", "large", "flexi", "hybrid"], lang).text), `all in ${lang}`).toBe(false);
    }
  });

  test("the ranks are worded as SEBI's market-cap ranks, in every language", () => {
    for (const id of ["small", "mid", "large"] as const) {
      expect(fundTypeAnswer(id, "en").text).toContain("SEBI's market-cap ranks");
      expect(fundTypeAnswer(id, "hi").text).toContain("market-cap");
      expect(fundTypeAnswer(id, "hn").text).toContain("market-cap");
    }
  });

  test("every answer ends by saying it is general and picks no fund", () => {
    for (const id of ["small", "mid", "large", "flexi", "hybrid"] as const) {
      expect(fundTypeAnswer(id, "en").text).toMatch(/does not say which fund/i);
    }
  });

  test("offers the next type one at a time: small, mid, large, flexi, hybrid, then nothing", () => {
    expect(nextFundType("small")).toBe("mid");
    expect(nextFundType("mid")).toBe("large");
    expect(nextFundType("large")).toBe("flexi");
    expect(nextFundType("flexi")).toBe("hybrid");
    expect(nextFundType("hybrid")).toBeNull();
  });

  test("a question naming several types answers all of them, in the order named, with the general line once (T2's question)", () => {
    const answer = fundTypesAnswer(["small", "mid", "large"], "en");
    expect(answer.text).toContain("251 and below");
    expect(answer.text).toContain("101 to 250");
    expect(answer.text).toContain("100 biggest");
    expect(answer.text.indexOf("small cap")).toBeLessThan(answer.text.indexOf("mid cap"));
    expect(answer.text.indexOf("mid cap")).toBeLessThan(answer.text.indexOf("large cap"));
    expect(answer.text.match(/does not say which fund/g)).toHaveLength(1);
    expect(answer.ids).toEqual(["small", "mid", "large"]);
  });

  test("the next basic after several is the first type after the last named one, or nothing", () => {
    expect(fundTypesAnswer(["small", "mid", "large"], "en").next).toBe("flexi");
    expect(fundTypesAnswer(["large", "mid"], "en").next).toBe("flexi");
    expect(fundTypesAnswer(["mid", "hybrid"], "en").next).toBeNull();
    expect(fundTypesAnswer(["small"], "en").next).toBe("mid");
  });
});
