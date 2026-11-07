import { describe, expect, test } from "vitest";
import { LANGS } from "@/lib/copy/dictionary";
import { detectFundTypes, fundTypeAnswer, nextFundType } from "./fund-types";

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

  test("the English answers keep to the definitions: sizes by rank, the share each fund puts in", () => {
    expect(fundTypeAnswer("large", "en").text).toMatch(/100/);
    expect(fundTypeAnswer("large", "en").text).toMatch(/80%/);
    expect(fundTypeAnswer("mid", "en").text).toMatch(/101/);
    expect(fundTypeAnswer("mid", "en").text).toMatch(/65%/);
    expect(fundTypeAnswer("small", "en").text).toMatch(/251/);
    expect(fundTypeAnswer("small", "en").text).toMatch(/65%/);
    expect(fundTypeAnswer("flexi", "en").text).toMatch(/any size/);
    expect(fundTypeAnswer("flexi", "en").text).toMatch(/65%/);
    expect(fundTypeAnswer("flexi", "en").text).toMatch(/large, mid and small/);
    expect(fundTypeAnswer("hybrid", "en").text).toMatch(/65% to 80%/);
    expect(fundTypeAnswer("hybrid", "en").text).toMatch(/10% to 25%/);
    expect(fundTypeAnswer("hybrid", "en").text).toMatch(/shares/i);
    expect(fundTypeAnswer("hybrid", "en").text).toMatch(/bonds/i);
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

  test("when the question named two types, the next one is the other type it named", () => {
    expect(fundTypeAnswer("mid", "en", ["mid", "large"]).next).toBe("large");
    expect(fundTypeAnswer("large", "en", ["large", "mid"]).next).toBe("mid");
    expect(fundTypeAnswer("small", "en").next).toBe("mid");
  });

  test("describes the fund's holdings, in words that cannot read as telling the person to invest", () => {
    for (const lang of ["en", "hi", "hn"] as const) {
      for (const id of ["small", "mid", "large", "flexi", "hybrid"] as const) {
        expect(fundTypeAnswer(id, lang).text).not.toMatch(/its money|अपने पैसे|apne paise|लगाता|lagata/);
      }
    }
  });
});
