import { describe, expect, test } from "vitest";
import { classifyCase, fallsCheckResult, GUESSES, isMisread, openingKeys, readOf } from "./cases";
import type { Case, Guess } from "./cases";

/*
 * The five cases (docs/reference/copy.md, section 5a). "Close" means within 1.5 percentage points.
 * The inputs are the moves the person sees, to one decimal (the facts object rounds them first).
 */
describe("classifyCase", () => {
  test("both fell, about the same: SAME (the sample SIP: fund -11.7%, market -11.3%)", () => {
    expect(classifyCase(-11.7, -11.3)).toBe("SAME");
  });

  test("both fell, the fund fell more than 1.5 points more: FUND_MORE", () => {
    expect(classifyCase(-8.0, -3.0)).toBe("FUND_MORE");
  });

  test("both fell, the fund fell more than 1.5 points less: FUND_LESS", () => {
    expect(classifyCase(-1.0, -6.0)).toBe("FUND_LESS");
  });

  test("the market rose and the fund fell: MARKET_UP", () => {
    expect(classifyCase(-2.5, 3.1)).toBe("MARKET_UP");
  });

  test("the market was flat and the fund fell: MARKET_UP", () => {
    expect(classifyCase(-2.5, 0)).toBe("MARKET_UP");
  });

  test("the fund rose: FUND_UP, whatever the market did", () => {
    expect(classifyCase(2.0, -4.0)).toBe("FUND_UP");
    expect(classifyCase(2.0, 5.0)).toBe("FUND_UP");
  });

  test("exactly 1.5 points apart is still close (SAME), in both directions", () => {
    // -10.2 - (-11.7) is 1.4999999999999982 in floating point: the boundary must not depend on that.
    expect(classifyCase(-11.7, -10.2)).toBe("SAME");
    expect(classifyCase(-10.2, -11.7)).toBe("SAME");
    expect(classifyCase(-4.5, -3.0)).toBe("SAME");
    expect(classifyCase(-3.0, -4.5)).toBe("SAME");
  });

  test("1.6 points apart is not close", () => {
    expect(classifyCase(-4.6, -3.0)).toBe("FUND_MORE");
    expect(classifyCase(-3.0, -4.6)).toBe("FUND_LESS");
  });

  test("a flat fund with a falling market is FUND_LESS (it fell less)", () => {
    expect(classifyCase(0, -3.2)).toBe("FUND_LESS");
  });

  test("a flat fund with a flat or rising market is FUND_UP (it did not fall)", () => {
    expect(classifyCase(0, 0)).toBe("FUND_UP");
    expect(classifyCase(0, 2.4)).toBe("FUND_UP");
  });
});

describe("isMisread", () => {
  const misreads: [Guess, Case][] = [
    ["fund", "SAME"],
    ["fund", "FUND_LESS"],
    ["fund", "FUND_UP"],
    ["market", "MARKET_UP"],
    ["market", "FUND_UP"],
  ];
  const reads: [Guess, Case][] = [
    ["fund", "FUND_MORE"],
    ["fund", "MARKET_UP"],
    ["market", "SAME"],
    ["market", "FUND_LESS"],
    ["market", "FUND_MORE"],
  ];

  test.each(misreads)("blaming %s in case %s is a misread", (guess, c) => {
    expect(isMisread(guess, c)).toBe(true);
  });

  test.each(reads)("blaming %s in case %s is not a misread", (guess, c) => {
    expect(isMisread(guess, c)).toBe(false);
  });

  test("'don't know' and 'not worth it' are never a misread", () => {
    for (const c of ["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"] as Case[]) {
      expect(isMisread("dunno", c)).toBe(false);
      expect(isMisread("worth", c)).toBe(false);
    }
  });
});

/* The quick check after the reason offers the same four taps as the first guess and is scored by the same rule. */
describe("readOf: one rule for the first guess and the quick check", () => {
  test("a fund or market tap is 'right' or 'wrong' by the misread rule", () => {
    expect(readOf("market", "SAME")).toBe("right");
    expect(readOf("fund", "SAME")).toBe("wrong");
    expect(readOf("fund", "FUND_MORE")).toBe("right");
    expect(readOf("market", "FUND_UP")).toBe("wrong");
  });

  test("'don't know' and 'not worth it' say nothing about what moved the money: 'none'", () => {
    for (const c of ["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"] as Case[]) {
      expect(readOf("dunno", c)).toBe("none");
      expect(readOf("worth", c)).toBe("none");
    }
  });

  test("agrees with isMisread for every guess and case", () => {
    for (const g of GUESSES) {
      for (const c of ["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"] as Case[]) {
        if (g === "fund" || g === "market") expect(readOf(g, c) === "wrong").toBe(isMisread(g, c));
        else expect(readOf(g, c)).toBe("none");
      }
    }
  });

  test("a random tap among the four reads right at most half the time, and usually a quarter", () => {
    const counts = (["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"] as Case[]).map(
      (c) => GUESSES.filter((g) => readOf(g, c) === "right").length,
    );
    expect(counts).toEqual([1, 2, 1, 1, 0]);
  });
});

describe("fallsCheckResult: the before and after of the same person, the same fall, the same rule", () => {
  test("scores the first guess and the check tap with readOf", () => {
    expect(fallsCheckResult("fund", "market", "SAME")).toEqual({ case: "SAME", before: "wrong", after: "right" });
    expect(fallsCheckResult("dunno", "fund", "FUND_MORE")).toEqual({ case: "FUND_MORE", before: "none", after: "right" });
    expect(fallsCheckResult("market", "worth", "SAME")).toEqual({ case: "SAME", before: "right", after: "none" });
  });
});

/* The opening line by guess and case (copy.md, section 5c). Keys are the names in the dictionary. */
describe("openingKeys", () => {
  test("my fund + SAME or FUND_LESS: 'This fall isn't just your fund.'", () => {
    expect(openingKeys("fund", "SAME")).toEqual(["fundNotJust"]);
    expect(openingKeys("fund", "FUND_LESS")).toEqual(["fundNotJust"]);
  });

  test("my fund + FUND_MORE: 'Partly right.'", () => {
    expect(openingKeys("fund", "FUND_MORE")).toEqual(["partlyRight"]);
  });

  test("my fund + MARKET_UP: 'You read it right.'", () => {
    expect(openingKeys("fund", "MARKET_UP")).toEqual(["readRight"]);
  });

  test("my fund + FUND_UP: 'Your fund didn't fall this month.'", () => {
    expect(openingKeys("fund", "FUND_UP")).toEqual(["fundDidntFall"]);
  });

  test("the whole market + SAME or FUND_LESS: 'You read it right.'", () => {
    expect(openingKeys("market", "SAME")).toEqual(["readRight"]);
    expect(openingKeys("market", "FUND_LESS")).toEqual(["readRight"]);
  });

  test("the whole market + FUND_MORE: 'Partly right.'", () => {
    expect(openingKeys("market", "FUND_MORE")).toEqual(["partlyRight"]);
  });

  test("the whole market + MARKET_UP or FUND_UP: 'Not quite.'", () => {
    expect(openingKeys("market", "MARKET_UP")).toEqual(["notQuite"]);
    expect(openingKeys("market", "FUND_UP")).toEqual(["notQuite"]);
  });

  test("don't know: the common-question line, plus the share-market line only for SAME and FUND_LESS", () => {
    expect(openingKeys("dunno", "SAME")).toEqual(["dunno", "dunnoSecond"]);
    expect(openingKeys("dunno", "FUND_LESS")).toEqual(["dunno", "dunnoSecond"]);
    expect(openingKeys("dunno", "FUND_MORE")).toEqual(["dunno"]);
    expect(openingKeys("dunno", "MARKET_UP")).toEqual(["dunno"]);
    expect(openingKeys("dunno", "FUND_UP")).toEqual(["dunno"]);
  });

  test("not worth it: the person's own months and rupees, in every case", () => {
    for (const c of ["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"] as Case[]) {
      expect(openingKeys("worth", c)).toEqual(["worth"]);
    }
  });

  test("every guess has an opening line in every case", () => {
    for (const g of GUESSES) {
      for (const c of ["SAME", "FUND_MORE", "FUND_LESS", "MARKET_UP", "FUND_UP"] as Case[]) {
        expect(openingKeys(g, c).length).toBeGreaterThan(0);
      }
    }
  });
});
