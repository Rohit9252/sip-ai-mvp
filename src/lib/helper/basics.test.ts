import { describe, expect, test } from "vitest";
import { learnCards } from "@/lib/copy/learn";
import { CASES } from "./cases";
import { basicsFor } from "./basics";

describe("basicsFor: the basics are shown one at a time, the most useful one first", () => {
  test("every case gets each basic exactly once", () => {
    for (const c of CASES) {
      const ids = basicsFor(c).map((card) => card.id);
      expect([...ids].sort()).toEqual(learnCards.map((card) => card.id).sort());
    }
  });

  test("a fall shared with the market starts with the Nifty 50", () => {
    expect(basicsFor("SAME")[0].id).toBe("nifty");
    expect(basicsFor("FUND_LESS")[0].id).toBe("nifty");
  });

  test("a fall the fund made on its own starts with 'below what you put in'", () => {
    expect(basicsFor("MARKET_UP")[0].id).toBe("below");
    expect(basicsFor("FUND_MORE")[0].id).toBe("below");
  });

  test("a rising fund still below what was put in starts with how a SIP buys units", () => {
    expect(basicsFor("FUND_UP")[0].id).toBe("units");
  });

  test("with no case (before any setback) the order is the plain order of the cards", () => {
    expect(basicsFor(null).map((card) => card.id)).toEqual(learnCards.map((card) => card.id));
  });
});
