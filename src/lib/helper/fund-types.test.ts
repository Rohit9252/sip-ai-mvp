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
  ])("%s", (question, types) => {
    expect(detectFundTypes(question)).toEqual(types);
  });

  test.each([
    "What is NAV?",
    "Did my fund do worse than the market?",
    "Is my fund a large cap fund?",
    "Mera paisa kahan gaya?",
    "इस महीने मेरा fund कितना गिरा?",
  ])("not a fund-type question: %s", (question) => {
    expect(detectFundTypes(question)).toEqual([]);
  });
});

describe("fundTypeAnswer: general terms from AMFI and SEBI, in the person's language", () => {
  test("gives text for each type in each language", () => {
    for (const lang of LANGS) {
      for (const id of ["small", "mid", "large", "hybrid"] as const) {
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
    expect(fundTypeAnswer("hybrid", "en").text).toMatch(/shares/i);
    expect(fundTypeAnswer("hybrid", "en").text).toMatch(/bonds/i);
  });

  test("every answer ends by saying it is general and picks no fund", () => {
    for (const id of ["small", "mid", "large", "hybrid"] as const) {
      expect(fundTypeAnswer(id, "en").text).toMatch(/does not say which fund/i);
    }
  });

  test("offers the next type one at a time: small, mid, large, hybrid, then nothing", () => {
    expect(nextFundType("small")).toBe("mid");
    expect(nextFundType("mid")).toBe("large");
    expect(nextFundType("large")).toBe("hybrid");
    expect(nextFundType("hybrid")).toBeNull();
  });

  test("when the question named two types, the next one is the other type it named", () => {
    expect(fundTypeAnswer("mid", "en", ["mid", "large"]).next).toBe("large");
    expect(fundTypeAnswer("large", "en", ["large", "mid"]).next).toBe("mid");
    expect(fundTypeAnswer("small", "en").next).toBe("mid");
  });
});
