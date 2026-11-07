import { beforeAll, describe, expect, test } from "vitest";
import { sampleFacts } from "@/lib/testing/sample-facts";
import type { Facts } from "@/lib/sip";
import { allowedNumbers, checkReply, totalsAsThisMonth } from "./reply";

/*
 * Added after the eval version 3 review: a reply said "you put in ₹8,000 this month" when ₹8,000 was the total of four
 * instalments. The number was in the facts, so the number check passed it. This check is narrow on purpose: it only
 * looks for the total invested, in the same clause as "this month" and a word for putting money in.
 * The sample SIP: invested ₹40,000 in 8 instalments of ₹5,000.
 */
let facts: Facts;
beforeAll(async () => {
  facts = await sampleFacts();
});

describe("totalsAsThisMonth: the total invested must not be described as this month's", () => {
  test.each([
    "You put in ₹40,000 this month.",
    "This month you invested ₹40,000 in your SIP.",
    "आपने इस महीने ₹40,000 लगाए थे।",
    "Aapne is mahine ₹40,000 lagaye hain.",
  ])("flagged: %s", (text) => {
    expect(totalsAsThisMonth(text, facts)).toEqual(["₹40,000"]);
  });

  test.each([
    "This month your fund fell 11.7%. You have put in ₹40,000 so far.",
    "Your ₹40,000 is now ₹35,785, after this month's fall.",
    "You put in ₹5,000 this month, one instalment.",
    "You put in ₹40,000 over 8 months, but this month your fund fell 11.7%.",
    "आपने अब तक ₹40,000 लगाए हैं। इस महीने fund 11.7% गिरा।",
  ])("not flagged: %s", (text) => {
    expect(totalsAsThisMonth(text, facts)).toEqual([]);
  });

  test("in month 1 the total is the one instalment, so it is not flagged", () => {
    const first: Facts = { ...facts, invested: { amount: 5000, text: "₹5,000" } };
    expect(totalsAsThisMonth("You put in ₹5,000 this month.", first)).toEqual([]);
  });
});

describe("checkReply with the facts", () => {
  test("fails a reply that describes the total as this month's, even though the number is in the facts", () => {
    const check = checkReply("You put in ₹40,000 this month.", allowedNumbers(facts), facts);
    expect(check.ok).toBe(false);
    expect(check.problems).toContain("total-as-month");
  });

  test("without the facts the check is not run, so older callers are unchanged", () => {
    expect(checkReply("You put in ₹40,000 this month.", allowedNumbers(facts)).problems).not.toContain("total-as-month");
  });
});
