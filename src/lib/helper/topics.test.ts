import { beforeAll, describe, expect, test } from "vitest";
import { LANGS } from "@/lib/copy/dictionary";
import { allowedNumbers, checkReply } from "@/lib/guard/reply";
import { sampleFacts } from "@/lib/testing/sample-facts";
import type { Facts } from "@/lib/sip";
import { detectFactsTopic, detectLearnTopic, detectNumbersTopic, detectPeriod, detectStopTopic, factsAnswer, numbersAnswer, stopAnswer } from "./topics";

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
    ["What does exit load mean?", "exit-meaning"],
    ["Exit load ka matlab kya hota hai", "exit-meaning"],
    ["एग्ज़िट लोड क्या होता है?", "exit-meaning"],
  ])("%s", (question, id) => {
    expect(detectLearnTopic(question)?.id).toBe(id);
  });

  test("an exit load is defined in plain words: a fee taken from what you withdraw within a set time, no figure, no claim about this fund", () => {
    const en = detectLearnTopic("What is an exit load?")!.body.en;
    expect(en).toContain("fee");
    expect(en).toContain("withdraw");
    expect(en).not.toMatch(/₹|%|this fund|tax/i);
    for (const lang of LANGS) {
      const text = detectLearnTopic("Exit load kya hota hai")!.body[lang];
      expect(text).not.toMatch(/₹|\d/);
    }
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

describe("detectPeriod: this month or since the start", () => {
  test.each([
    ["Since my first instalment, how has my fund done against the market?", "start"],
    ["Shuru se ab tak mera fund market se kaisa raha?", "start"],
    ["शुरू से अब तक मेरा fund market से कैसा रहा?", "start"],
    ["Did the market fall more than my fund in the setback month?", "month"],
    ["Mera fund market se zyada gira ya kam?", "month"],
  ])("%s", (question, period) => expect(detectPeriod(question)).toBe(period));
});

describe("factsAnswer: the direct answer first, in one plain line, then the numbers", () => {
  test("a comparison for the month: 'about the same' first, then this month's numbers, then since the start", () => {
    const parts = factsAnswer(facts, "compare", "en", "month").split("\n\n");
    expect(parts[0]).toBe("Your fund and the whole market moved about the same in March 2026.");
    expect(parts[1]).toContain("11.7%");
    expect(parts[1]).toContain("11.3%");
    expect(parts[2]).toContain("5 Aug 2025 to 31 Mar 2026");
    expect(parts[2]).toContain("7.0%");
    expect(parts[2]).toContain("9.1%");
  });

  test("a comparison since the start opens with that period, not with this month (A05)", () => {
    const parts = factsAnswer(facts, "compare", "en", "start").split("\n\n");
    expect(parts[0]).toBe("Your fund came out ahead of the whole market since your first instalment.");
    expect(parts[1]).toContain("5 Aug 2025 to 31 Mar 2026");
    expect(parts[2]).toContain("11.7%");
  });

  test("a fund that came out behind is said so", () => {
    const worse: Facts = {
      ...facts,
      monthMove: { ...facts.monthMove, fundMove: { pct: -9.0, text: "-9.0%", absText: "9.0%" }, marketMove: { pct: -3.0, text: "-3.0%", absText: "3.0%" } },
    };
    expect(factsAnswer(worse, "compare", "en", "month").split("\n\n")[0]).toBe("Your fund came out behind the whole market in March 2026.");
  });

  test("a why-below answer opens with the reason in one plain line, then both periods", () => {
    const parts = factsAnswer(facts, "why-below", "en").split("\n\n");
    expect(parts[0]).toBe(
      "Your ₹40,000 is now worth ₹35,785, which is ₹4,215 below what you put in. That is because the fund's price today is lower than the average price your instalments paid.",
    );
    expect(parts[1]).toContain("11.7%");
    expect(parts[2]).toContain("7.0%");
  });

  test("a why-below question when the value is not below says so and gives no reason for a fall", () => {
    const above: Facts = { ...facts, value: { amount: 41000, text: "₹41,000" }, gain: { amount: 1000, text: "₹1,000", absText: "₹1,000" } };
    const first = factsAnswer(above, "why-below", "en").split("\n\n")[0];
    expect(first).toBe("Your value is not below what you put in. It is ₹1,000 above.");
  });

  test("in all three languages: no unfilled braces, every number from the facts, no advice, no prediction", () => {
    for (const lang of LANGS) {
      for (const topic of ["compare", "why-below"] as const) {
        for (const period of ["month", "start"] as const) {
          const text = factsAnswer(facts, topic, lang, period);
          expect(text).not.toMatch(/[{}]/);
          const check = checkReply(text, allowedNumbers(facts), facts);
          expect(check.problems.filter((p) => p !== "length"), `${topic} ${period} ${lang}`).toEqual([]);
        }
      }
    }
  });
});

describe("detectStopTopic: 'what happens to my money if I stop'", () => {
  test.each([
    "What happens to my money if I stop paying?",
    "If I stop my SIP, where does my money go?",
    "SIP band karne par paisa kahan jaata hai?",
    "Agar main SIP band kar doon to mere jama paise ka kya hoga?",
    "अगर SIP रोक दूँ तो पैसे का क्या होगा?",
    "SIP रोकने पर मेरा जमा पैसा कहाँ रहता है?",
  ])("%s", (question) => expect(detectStopTopic(question)).toBe(true));

  test.each(["How do I stop my SIP?", "What is a SIP?", "Why did my value fall?", "What is an exit load?"])("not: %s", (question) =>
    expect(detectStopTopic(question)).toBe(false),
  );
});

describe("stopAnswer: the current value, never the amount invested, and no guessed exit load (A12)", () => {
  test("says the units stay, worth the current value on the date, and nothing is sold", () => {
    const text = stopAnswer(facts, "en");
    expect(text).toBe(
      "Stopping ends the instalments still to come. The units you already hold stay in your fund, worth ₹35,785 on 31 Mar 2026, until you withdraw them. Nothing is sold when you stop.",
    );
  });

  test("in all three languages it names ₹35,785 and never ₹40,000 or an exit load figure", () => {
    for (const lang of LANGS) {
      const text = stopAnswer(facts, lang);
      expect(text, lang).toContain("₹35,785");
      expect(text, lang).not.toContain("₹40,000");
      expect(text, lang).not.toContain("₹358");
      expect(text).not.toMatch(/[{}]/);
      const check = checkReply(text, allowedNumbers(facts), facts);
      expect(check.problems.filter((p) => p !== "length"), lang).toEqual([]);
    }
  });
});

describe("detectNumbersTopic and numbersAnswer: plain questions about the person's own amounts", () => {
  test.each([
    ["In total, what have I invested and what is my value now?", "invested"],
    ["Ab tak maine kul kitna paisa lagaya hai?", "invested"],
    ["मैंने अब तक कुल कितना पैसा लगाया है?", "invested"],
    ["How many instalments have I paid so far?", "instalments"],
    ["Meri kitni kishtein ho chuki hain?", "instalments"],
    ["By how much is my value below what I invested?", "gap"],
    ["इस महीने मेरा fund कितने percent गिरा?", "month-move"],
  ])("%s", (question, topic) => expect(detectNumbersTopic(question)).toBe(topic));

  test.each(["How much exit load will I pay if I withdraw?", "What is NAV?", "How many months have I been investing?"])("not: %s", (question) =>
    expect(detectNumbersTopic(question)).toBeNull(),
  );

  test("each gives one plain line from the facts", () => {
    expect(numbersAnswer(facts, "invested", "en")).toBe("You have put in ₹40,000 in 8 instalments of ₹5,000. It is now worth ₹35,785.");
    expect(numbersAnswer(facts, "instalments", "en")).toBe("You have paid 8 instalments of ₹5,000 each, ₹40,000 in all.");
    expect(numbersAnswer(facts, "gap", "en")).toBe("Your value is ₹4,215 below what you put in.");
    expect(numbersAnswer(facts, "month-move", "en")).toContain("Your fund fell 11.7%");
  });

  test("in all three languages: no braces, every number from the facts, no advice or prediction", () => {
    for (const lang of LANGS) {
      for (const topic of ["invested", "instalments", "gap", "month-move"] as const) {
        const text = numbersAnswer(facts, topic, lang);
        expect(text).not.toMatch(/[{}]/);
        const check = checkReply(text, allowedNumbers(facts), facts);
        expect(check.problems.filter((p) => p !== "length"), `${topic} ${lang}`).toEqual([]);
      }
    }
  });
});
