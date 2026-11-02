import { describe, expect, test } from "vitest";
import { formatDate, formatMonth, formatPercent, formatRupees } from "./format";

describe("formatRupees (Indian digit grouping)", () => {
  test.each([
    [0, "₹0"],
    [7, "₹7"],
    [999, "₹999"],
    [1000, "₹1,000"],
    [4215, "₹4,215"],
    [100000, "₹1,00,000"],
    [123456, "₹1,23,456"],
    [1234567, "₹12,34,567"],
    [123456789, "₹12,34,56,789"],
  ])("%i is shown as %s", (amount, text) => {
    expect(formatRupees(amount)).toBe(text);
  });

  test("a negative amount keeps the minus sign in front", () => {
    expect(formatRupees(-4215)).toBe("-₹4,215");
    expect(formatRupees(-123456)).toBe("-₹1,23,456");
  });

  test("paise are rounded away to whole rupees", () => {
    expect(formatRupees(35784.77)).toBe("₹35,785");
    expect(formatRupees(-0.4)).toBe("₹0");
  });
});

describe("formatPercent (one decimal)", () => {
  test.each([
    [-11.719, "-11.7%"],
    [-11.32, "-11.3%"],
    [12.5, "12.5%"],
    [3, "3.0%"],
    [0, "0.0%"],
  ])("%f is shown as %s", (pct, text) => {
    expect(formatPercent(pct)).toBe(text);
  });

  test("a tiny fall that rounds to zero is shown without a minus sign", () => {
    expect(formatPercent(-0.04)).toBe("0.0%");
  });
});

describe("dates", () => {
  test("formatDate writes day, short month and year", () => {
    expect(formatDate("2026-03-31")).toBe("31 Mar 2026");
    expect(formatDate("2025-08-05")).toBe("5 Aug 2025");
  });

  test("formatMonth writes short month and year", () => {
    expect(formatMonth("2025-08")).toBe("Aug 2025");
  });
});
