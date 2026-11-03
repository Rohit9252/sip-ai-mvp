import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";
import { createNavClient } from "@/lib/nav/client";
import { SAMPLE_SIP, simulateSip } from "@/lib/sip";
import type { Facts } from "@/lib/sip";
import { classifyQuestion } from "./question";
import { allowedNumbers, checkReply, numbersIn } from "./reply";

const fixtureDir = join(__dirname, "..", "nav", "__fixtures__");
const fakeMfapi = (async (url: string | URL | Request) => {
  const code = String(url).split("/").pop();
  const file = code === "118955" ? "hdfc-flexi-cap-118955.json" : "uti-nifty-50-120716.json";
  return new Response(readFileSync(join(fixtureDir, file), "utf8"), { status: 200 });
}) as typeof fetch;

let facts: Facts;
beforeAll(async () => {
  const client = createNavClient({ fetch: fakeMfapi });
  const [fund, market] = await Promise.all([client.getNavHistory(SAMPLE_SIP.schemeCode), client.getMarketHistory()]);
  facts = simulateSip({ fund, market, ...SAMPLE_SIP, asOf: "2026-04-10" }).facts!;
});

describe("classifyQuestion: advice and predictions are caught before any AI call", () => {
  test.each([
    "Should I switch to another fund?",
    "should i stop my sip now",
    "Which fund is best for me?",
    "Can you suggest a better fund?",
    "Is it a good time to invest more?",
    "Kya mujhe doosra fund le lena chahiye?",
    "sip band kar du kya",
    "kaunsa fund lu",
    "ab kya karu",
    "क्या मुझे दूसरा fund ले लेना चाहिए?",
    "क्या मैं SIP बंद कर दूँ?",
    "Was HDFC Flexi Cap a bad choice?",
    "Is HDFC Flexi Cap safe to keep?",
    "my friend says index funds are better, is he right?",
    "Is FD safer than this?",
    "kya ye fund safe hai",
    "क्या ये fund सुरक्षित है?",
  ])("advice: %s", (q) => expect(classifyQuestion(q)).toBe("advice"));

  test.each([
    "How long will this fall last?",
    "When will my fund recover?",
    "Will the market go up next year?",
    "How much will I get in 5 years?",
    "Ye girawat kab tak rahegi?",
    "market kab badhega",
    "ये गिरावट कब तक रहेगी?",
    "क्या ये वापस आएगा?",
  ])("prediction: %s", (q) => expect(classifyQuestion(q)).toBe("prediction"));

  test.each([
    "What happens if I stop now?",
    "Agar main abhi rok doon to kya hoga?",
    "अगर मैं अभी रोक दूँ तो क्या होगा?",
    "Did my fund do worse than the market?",
    "Why did my value fall in March?",
    "What is NAV?",
    "Mera paisa kahan gaya?",
    "How much have I put in so far?",
  ])("answered: %s", (q) => expect(classifyQuestion(q)).toBe("ok"));
});

describe("numbersIn", () => {
  test("reads rupees, percents and Devanagari digits", () => {
    expect(numbersIn("₹35,785 is 11.7% and ११.३%")).toEqual(["35785", "11.7", "11.3"]);
  });
});

describe("checkReply: every AI reply is checked before it is shown", () => {
  test("a reply that uses only the facts passes", () => {
    const allowed = allowedNumbers(facts);
    const reply = "In March 2026 the whole market (Nifty 50) fell 11.3% and your fund fell 11.7%. Your ₹40,000 is now ₹35,785.";
    expect(checkReply(reply, allowed)).toEqual({ ok: true, problems: [], badNumbers: [] });
  });

  test("the gap between invested and value is allowed", () => {
    expect(checkReply("Your value is ₹4,215 below what you put in.", allowedNumbers(facts)).ok).toBe(true);
  });

  test("an invented number fails", () => {
    const check = checkReply("Your fund fell 12.5% this month.", allowedNumbers(facts));
    expect(check.problems).toContain("number");
    expect(check.badNumbers).toEqual(["12.5"]);
  });

  test("an extra fact passed by the route is allowed", () => {
    expect(checkReply("The exit load would be about ₹358.", allowedNumbers(facts, [358])).ok).toBe(true);
  });

  test.each([
    "You should keep going, it will recover.",
    "Don't worry, stay invested.",
    "I recommend switching to an index fund.",
    "Aapko SIP chalu rakhni chahiye.",
    "चिंता मत कीजिए, market वापस आएगा।",
  ])("advice or a prediction fails: %s", (reply) => {
    const check = checkReply(reply, allowedNumbers(facts));
    expect(check.ok).toBe(false);
    expect(check.problems.some((p) => p === "advice" || p === "prediction")).toBe(true);
  });

  test("a past fall is not a prediction", () => {
    expect(checkReply("इस महीने पूरा market (Nifty 50) 11.3% गिरा और आपका fund 11.7% गिरा।", allowedNumbers(facts)).ok).toBe(true);
  });

  test("an em dash or a long reply fails", () => {
    expect(checkReply("Your fund — like the market — fell.", allowedNumbers(facts)).problems).toContain("em-dash");
    expect(checkReply("a".repeat(600), allowedNumbers(facts)).problems).toContain("length");
  });
});
