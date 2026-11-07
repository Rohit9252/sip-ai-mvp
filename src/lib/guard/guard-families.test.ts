import { describe, expect, test } from "vitest";
import { classifyQuestion } from "./question";

/*
 * Added after eval version 1 (docs/evals/2026-11-07-eval-v1.md). The first run of the golden set found advice and
 * prediction questions the patterns were never written for: "is it wise to ...", "how long until I break even",
 * "... theek rahega", "... safe rahega". These tests hold the whole phrasing family, written fresh here, not only the
 * four questions that failed. The golden questions themselves are not copied into any test.
 */
describe("classifyQuestion: more ways to ask for advice", () => {
  test.each([
    "Would it be okay to withdraw everything now?",
    "Is it sensible to continue for another year?",
    "Is that wise, to carry on paying every month?",
    "Would it be smart to put in a bigger amount?",
    "क्या SIP जारी रखना ठीक रहेगा?",
    "क्या दूसरा fund बेहतर रहेगा?",
    "क्या अभी निकालना सही होगा?",
    "Kya ab SIP badalna theek rahega?",
    "Kya gold mere fund se safe rahega?",
    "Kya yeh fund chhodna sahi hoga?",
  ])("advice: %s", (q) => expect(classifyQuestion(q)).toBe("advice"));
});

describe("classifyQuestion: more ways to ask for a prediction", () => {
  test.each([
    "How long before I get my money back?",
    "By when will I break even?",
    "Will I break even by next March?",
    "How many years until my value is above what I put in?",
    "Kitne mahine mein paisa wapas aayega?",
    "Mera paisa December tak kitna ho jaega?",
    "मेरा पैसा कितने महीने में वापस आएगा?",
  ])("prediction: %s", (q) => expect(classifyQuestion(q)).toBe("prediction"));
});

describe("classifyQuestion: fair questions still get through", () => {
  test.each([
    "How many months have I been investing?",
    "Is it normal that my value is below what I put in?",
    "What does break even mean?",
    "How many instalments are left to pay?",
    "Kya mera fund is mahine market se zyada gira?",
    "मेरे कितने महीने हो गए हैं?",
    "अगर मैं SIP बंद कर दूँ तो मेरे जमा पैसे का क्या होगा?",
    "Agar main SIP band kar doon to mere jama paise ka kya hoga?",
  ])("answered: %s", (q) => expect(classifyQuestion(q)).toBe("ok"));
});

/*
 * Added with the one-line refusals (founder, after the eval version 3 review): questions on future returns, "how much
 * by year end", "in 4 or 5 months" and "when will my money come back" must all reach the prediction refusal. Fresh
 * phrases in all three languages, not the golden questions.
 */
describe("classifyQuestion: future returns and getting the money back", () => {
  test.each([
    "How much will it be by the end of this year?",
    "How much will my fund make in 4 months?",
    "What will my SIP be worth in 5 months?",
    "What will it be at year end?",
    "Will I get my money back?",
    "How much return can I expect in 5 months?",
    "Kya mera paisa saal ke end tak badhega?",
    "5 mahine mein kitna return milega?",
    "Year end tak mera SIP kitne ka hoga?",
    "Mera paisa kab wapas milega yaar?",
    "साल के अंत तक मेरा SIP कितने का हो जाएगा?",
    "5 महीने में कितना रिटर्न मिलेगा?",
    "मेरा पैसा कब वापस मिलेगा?",
  ])("prediction: %s", (q) => expect(classifyQuestion(q)).toBe("prediction"));

  test.each([
    "How much exit load will I pay if I withdraw?",
    "How much did my fund fall in March?",
    "What is the NAV of my fund today?",
  ])("answered: %s", (q) => expect(classifyQuestion(q)).toBe("ok"));
});
