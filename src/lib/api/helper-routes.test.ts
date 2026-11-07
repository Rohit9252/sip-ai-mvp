import { beforeAll, describe, expect, test } from "vitest";
import { copy, t } from "@/lib/copy/dictionary";
import { ownFactsReply } from "@/lib/helper/own-facts";
import { sampleFacts } from "@/lib/testing/sample-facts";
import type { Facts } from "@/lib/sip";
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

  test("the offer says what is on offer: their fund against the market, what switching involves, what stopping does", async () => {
    const reply = await followupReply(facts, "Should I change my fund?", "en", false);
    expect(reply.text).toContain(t(copy.followup.offerAsk, "en"));
    expect(t(copy.followup.offerAsk, "en")).toMatch(/against the market/);
    expect(t(copy.followup.offerAsk, "en")).toMatch(/switching/);
    expect(t(copy.followup.offerAsk, "en")).toMatch(/stopping/);
  });

  test("a prediction question is refused with no offer", async () => {
    const reply = await followupReply(facts, "When will my fund recover?", "en", false);
    expect(reply.source).toBe("safe");
    expect(reply.kind).toBe("prediction");
    expect(reply.offer).toBeUndefined();
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

  test("a question naming two types answers the first and offers the other next", async () => {
    const reply = await followupReply(facts, "mid cap aur large cap mein kya fark hai", "hn", false);
    expect(reply.basic).toEqual({ id: "mid", next: "large" });
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
