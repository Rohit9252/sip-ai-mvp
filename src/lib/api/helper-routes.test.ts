import { beforeAll, describe, expect, test } from "vitest";
import { copy, t } from "@/lib/copy/dictionary";
import { ownFactsReply } from "@/lib/helper/own-facts";
import { sampleFacts } from "@/lib/testing/sample-facts";
import type { Facts } from "@/lib/sip";
import type { answerFollowup } from "@/lib/ai/helper-ai";
import { followupReply } from "./helper-routes";

let facts: Facts;
beforeAll(async () => {
  facts = await sampleFacts();
});

// The AI is never called here (useAi is false): these are the answers that code gives on its own.
describe("followupReply: an advice question is refused, then offers the person's own facts", () => {
  test.each(["Should I change my fund?", "kya mujhe fund badal lena chahiye", "क्या मुझे अपना fund बदल लेना चाहिए?"])(
    "%s",
    async (question) => {
      const reply = await followupReply(facts, question, "en", false);
      expect(reply.source).toBe("safe");
      expect(reply.kind).toBe("advice");
      expect(reply.offer).toBe("own-facts");
      expect(reply.text).toContain(t(copy.followup.safeAdvice, "en"));
    },
  );

  test("the refusal is one short line and the small pointer, and nothing else", async () => {
    const reply = await followupReply(facts, "Should I change my fund?", "en", false);
    expect(t(copy.followup.safeAdvice, "en")).toBe("This is outside what I can help with. I don't say what to do with your money or which fund to pick.");
    expect(reply.text).toBe(`${t(copy.followup.safeAdvice, "en")} ${t(copy.followup.adviser, "en")}`);
    expect(reply.link).toBe("amfi");
  });

  test("the refusal does not discuss the question, in any language", async () => {
    for (const lang of ["en", "hi", "hn"] as const) {
      const reply = await followupReply(facts, "Should I change my fund?", lang, false);
      expect(reply.text).toBe(`${t(copy.followup.safeAdvice, lang)} ${t(copy.followup.adviser, lang)}`);
      expect(reply.text).not.toMatch(/against the market|switching|exit load|stays/i);
    }
  });

  test("a prediction question gets its own one-line refusal, with the same pointer, and no offer", async () => {
    const reply = await followupReply(facts, "When will my fund recover?", "en", false);
    expect(reply.source).toBe("safe");
    expect(reply.kind).toBe("prediction");
    expect(reply.offer).toBeUndefined();
    expect(t(copy.followup.safePredict, "en")).toBe("This is outside what I can help with. A mutual fund moves with the market, so nobody can tell you this.");
    expect(reply.text).toBe(`${t(copy.followup.safePredict, "en")} ${t(copy.followup.adviser, "en")}`);
    expect(reply.link).toBe("amfi");
  });

  test.each([
    ["en", "How much will it be by the end of this year?"],
    ["en", "What will my SIP be worth in 5 months?"],
    ["hn", "5 mahine mein kitna return milega?"],
    ["hn", "Mera paisa kab wapas milega yaar?"],
    ["hi", "साल के अंत तक मेरा SIP कितने का हो जाएगा?"],
    ["hi", "मेरा पैसा कब वापस मिलेगा?"],
  ] as const)("future returns and the money coming back get the prediction refusal: %s %s", async (lang, question) => {
    const reply = await followupReply(facts, question, lang, false);
    expect(reply.kind).toBe("prediction");
    expect(reply.text).toBe(`${t(copy.followup.safePredict, lang)} ${t(copy.followup.adviser, lang)}`);
  });

  test("Hindi and Hinglish refusals open with the natural line (founder, after the eval version 4 review)", () => {
    expect(t(copy.followup.safeAdvice, "hi").startsWith("इस सवाल का जवाब मैं नहीं दे सकता।")).toBe(true);
    expect(t(copy.followup.safePredict, "hi").startsWith("इस सवाल का जवाब मैं नहीं दे सकता।")).toBe(true);
    expect(t(copy.followup.safeAdvice, "hn").startsWith("Is sawal ka jawab main nahi de sakta.")).toBe(true);
    expect(t(copy.followup.safePredict, "hn").startsWith("Is sawal ka jawab main nahi de sakta.")).toBe(true);
    expect(t(copy.followup.safeAdvice, "en").startsWith("This is outside what I can help with.")).toBe(true);
    expect(t(copy.followup.safePredict, "en").startsWith("This is outside what I can help with.")).toBe(true);
    expect(t(copy.followup.safeAdvice, "hi")).not.toContain("दायरे");
    expect(t(copy.followup.safeAdvice, "hn")).not.toContain("daayre");
  });

  test("the advice refusal covers stopping, withdrawing and adding, not only choosing a fund, in one short sentence", () => {
    expect(t(copy.followup.safeAdvice, "en")).toContain("what to do with your money");
    expect(t(copy.followup.safeAdvice, "hi")).toContain("आपके पैसे का क्या करें");
    expect(t(copy.followup.safeAdvice, "hn")).toContain("aapke paise ka kya karein");
    for (const lang of ["en", "hi", "hn"] as const) {
      expect(t(copy.followup.safeAdvice, lang).length).toBeLessThan(140);
    }
  });

  test("the prediction refusal never names or suggests a fund", () => {
    for (const lang of ["en", "hi", "hn"] as const) {
      expect(t(copy.followup.safePredict, lang)).not.toMatch(/recover|will rise|HDFC|index fund|large cap/i);
    }
  });

  test("the facts the offer leads to are the same facts, worked out by code", () => {
    expect(ownFactsReply(facts, "en").join(" ")).toContain("fell 7.0%");
  });
});

describe("followupReply: fund-type basics come from code, with no AI and no recommendation", () => {
  test("'What is a small cap fund?' gets the small cap definition", async () => {
    const reply = await followupReply(facts, "What is a small cap fund?", "en", false);
    expect(reply.kind).toBe("basics");
    expect(reply.source).toBe("template");
    expect(reply.basic).toEqual({ id: "small", next: "mid" });
    expect(reply.text).toMatch(/251/);
  });

  test("'What is a flexi cap fund?' gets the flexi cap definition and 'hybrid' follows it", async () => {
    const reply = await followupReply(facts, "What is a flexi cap fund?", "en", false);
    expect(reply).toMatchObject({ kind: "basics", source: "template", basic: { id: "flexi", next: "hybrid" } });
    expect(reply.text).toMatch(/any size/);
  });

  test("a question about the person's own flexi cap fund is not answered with a definition", async () => {
    const reply = await followupReply(facts, "What happened to my flexi cap fund this month?", "en", false);
    expect(reply.kind).not.toBe("basics");
  });

  test("a question naming two types answers both and offers the next type after them", async () => {
    const reply = await followupReply(facts, "mid cap aur large cap mein kya fark hai", "hn", false);
    expect(reply.basic).toEqual({ id: "mid", next: "flexi" });
    expect(reply.text).toContain("101ve se 250ve");
    expect(reply.text).toContain("sabse badi 100");
  });

  test("an advice question about a type is still refused", async () => {
    const reply = await followupReply(facts, "What is the best small cap fund for me?", "en", false);
    expect(reply.kind).toBe("advice");
    expect(reply.source).toBe("safe");
  });

  test("a question that only mentions a type, with no ask for what it is, is not a basics question", async () => {
    const reply = await followupReply(facts, "Is my fund a large cap fund?", "en", false);
    expect(reply.kind).not.toBe("basics");
  });
});

// The second lock (added after eval version 1): the AI also says what a question is asking for. A question the
// patterns miss but the AI reads as advice or a prediction gets the safe answer, not a written reply.
describe("followupReply: the AI's reading of the question is a second lock", () => {
  const asking = (intent: "facts" | "advice" | "prediction" | "unrelated", text = ""): typeof answerFollowup =>
    (async () => ({ text, offTopic: intent === "unrelated", intent })) as typeof answerFollowup;

  test("an advice question the patterns missed gets the safe answer and the offer, not the AI's reply", async () => {
    const reply = await followupReply(facts, "A question the patterns do not know", "en", true, asking("advice", "Stopping ends instalments."));
    expect(reply.source).toBe("safe");
    expect(reply.kind).toBe("advice");
    expect(reply.offer).toBe("own-facts");
    expect(reply.text).not.toContain("Stopping ends instalments.");
  });

  test("a prediction question the patterns missed gets the safe answer for predictions", async () => {
    const reply = await followupReply(facts, "A question the patterns do not know", "hn", true, asking("prediction", "It will rise."));
    expect(reply).toMatchObject({ source: "safe", kind: "prediction" });
    expect(reply.text).toBe(`${t(copy.followup.safePredict, "hn")} ${t(copy.followup.adviser, "hn")}`);
  });

  test("a facts question is answered, after the usual checks", async () => {
    const reply = await followupReply(facts, "Tell me about my SIP", "en", true, asking("facts", "You put in ₹40,000 in 8 instalments."));
    expect(reply).toMatchObject({ source: "ai", kind: "answered", text: "You put in ₹40,000 in 8 instalments." });
  });

  test("a facts reply with a number that is not in the facts is still thrown away", async () => {
    const reply = await followupReply(facts, "Tell me about my SIP", "en", true, asking("facts", "You put in ₹41,000."));
    expect(reply.kind).toBe("check-failed");
    expect(reply.source).toBe("safe");
  });

  test("an unrelated question gets the off-topic safe answer", async () => {
    const reply = await followupReply(facts, "Who won the match?", "en", true, asking("unrelated"));
    expect(reply).toMatchObject({ source: "safe", kind: "off-topic" });
  });

  test("when the AI is not asked (rate limit), a question the patterns missed still gets a safe reply", async () => {
    const reply = await followupReply(facts, "Anything", "en", false);
    expect(reply.source).toBe("safe");
  });
});

describe("followupReply: fair questions the AI answered loosely are now answered by code", () => {
  test("'Can you explain small cap, mid cap and large cap funds?' answers all three (T2)", async () => {
    const reply = await followupReply(facts, "Can you explain small cap, mid cap and large cap funds?", "en", false);
    expect(reply.kind).toBe("basics");
    expect(reply.text).toContain("251 and below");
    expect(reply.text).toContain("101 to 250");
    expect(reply.text).toContain("100 biggest");
    expect(reply.text.match(/does not say which fund/g)).toHaveLength(1);
    expect(reply.basic?.next).toBe("flexi");
  });

  test("'What is an exit load?' is a general definition, with no rupee figure and no claim about this fund", async () => {
    const reply = await followupReply(facts, "What is an exit load?", "en", false);
    expect(reply).toMatchObject({ kind: "basics", source: "template" });
    expect(reply.text).toContain("An exit load is a fee");
    expect(reply.text).not.toMatch(/₹|this fund/);
    expect(reply.learnPath).toBeTruthy();
  });

  test("'What happens if I stop?' is answered by code with the current value, never the amount invested (A12)", async () => {
    for (const [lang, question] of [
      ["hi", "अगर मैं SIP रोक दूँ तो जमा पैसे का क्या होता है?"],
      ["hn", "SIP band karne par mera jama paisa kahan rehta hai?"],
      ["en", "What happens to my money if I stop paying?"],
    ] as const) {
      const reply = await followupReply(facts, question, lang, false);
      expect(reply, question).toMatchObject({ kind: "facts", source: "template" });
      expect(reply.text, question).toContain("₹35,785");
      expect(reply.text, question).not.toContain("₹40,000");
      expect(reply.text, question).not.toContain("₹358");
    }
  });

  test("plain questions about the person's own amounts are answered by code", async () => {
    const invested = await followupReply(facts, "Ab tak maine kul kitna paisa lagaya hai?", "hn", false);
    expect(invested).toMatchObject({ kind: "facts", source: "template" });
    expect(invested.text).toContain("₹40,000");
    const count = await followupReply(facts, "How many instalments have I paid so far?", "en", false);
    expect(count.text).toBe("You have paid 8 instalments of ₹5,000 each, ₹40,000 in all.");
    const gap = await followupReply(facts, "By how much is my value below what I invested?", "en", false);
    expect(gap.text).toBe("Your value is ₹4,215 below what you put in.");
  });

  test("a comparison since the start opens with that period (A05) and one for the month opens with the month (A03)", async () => {
    const since = await followupReply(facts, "Since my first instalment, how has my fund done against the market?", "en", false);
    expect(since.text.split("\n\n")[0]).toBe("Your fund came out ahead of the whole market since your first instalment.");
    const month = await followupReply(facts, "In the setback month, did the market fall more than my fund?", "en", false);
    expect(month.text.split("\n\n")[0]).toBe("Your fund and the whole market moved about the same in March 2026.");
  });

  test("'why is my value below' opens with the reason in one plain line (A14, A19)", async () => {
    const reply = await followupReply(facts, "Meri value lagaye hue paise se neeche kyun hai?", "hn", false);
    expect(reply.text.split("\n\n")[0]).toContain("Wajah ye hai ki aaj fund ki keemat");
  });

  test("'What is the Nifty 50?' is the general definition, not tagged as the person's numbers", async () => {
    const reply = await followupReply(facts, "Nifty 50 kya hai?", "hn", false);
    expect(reply).toMatchObject({ kind: "basics", source: "template" });
    expect(reply.text).toContain("Nifty 50");
    expect(reply.learnPath).toBe("what-are-index-funds");
  });

  test("'Why is my value below what I put in?' gets the totals and both periods, from code", async () => {
    const reply = await followupReply(facts, "Meri value lagaye hue paise se neeche kyun hai?", "hn", false);
    expect(reply).toMatchObject({ kind: "facts", source: "template" });
    expect(reply.text).toContain("₹40,000");
    expect(reply.text).toContain("11.7%");
    expect(reply.text).toContain("7.0%");
  });

  test("'Did my fund fall more than the market?' gets this month and since the start", async () => {
    const reply = await followupReply(facts, "Mera fund market se zyada gira ya kam?", "hn", false);
    expect(reply).toMatchObject({ kind: "facts", source: "template" });
    expect(reply.text).toContain("11.7%");
    expect(reply.text).toContain("7.0%");
  });
});

// Last change before release: code answers only when a question truly matches a topic. Everything else goes to the AI
// path with its existing checks. With the AI off (useAi false) that path ends in "check-failed", so these show that no
// canned answer was given.
describe("followupReply: a question that only looks like a topic is not given a canned answer", () => {
  test.each([
    "What is the total expense ratio of my fund?",
    "How much total tax would I pay on this?",
    "What did I invest in?",
    "Did my fund do better than the market in January?",
    "Why did the market fall this month?",
    "Where do I stop my SIP in the app?",
  ])("goes to the AI path: %s", async (question) => {
    const reply = await followupReply(facts, question, "en", false);
    expect(reply.kind).toBe("check-failed");
    expect(reply.source).toBe("safe");
  });

  test("the same topics still match when the question truly is about them", async () => {
    const stop = await followupReply(facts, "If I stop my SIP, where does my money go?", "en", false);
    expect(stop.kind).toBe("facts");
    const invested = await followupReply(facts, "In total, what have I invested and what is my value now?", "en", false);
    expect(invested.kind).toBe("facts");
    const why = await followupReply(facts, "Why did my value fall?", "en", false);
    expect(why.kind).toBe("facts");
    const compare = await followupReply(facts, "Did my fund do worse than the market?", "en", false);
    expect(compare.kind).toBe("facts");
  });

  test("advice and prediction questions stay refused", async () => {
    expect((await followupReply(facts, "Should I stop my SIP?", "en", false)).kind).toBe("advice");
    expect((await followupReply(facts, "When will my money come back?", "en", false)).kind).toBe("prediction");
    expect((await followupReply(facts, "How much will it be by the end of this year?", "en", false)).kind).toBe("prediction");
  });
});
