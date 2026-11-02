import { describe, expect, test } from "vitest";
import { checkSipRequest, parseWholeNumber, startMonthOptions, startMonthRange, validateSetup } from "./rules";

describe("startMonthRange (4 to 24 months before today)", () => {
  test("on 2 Nov 2026 the newest month is July 2026 and the oldest is November 2024", () => {
    expect(startMonthRange("2026-11-02")).toEqual({ min: "2024-11", max: "2026-07" });
  });

  test("works across a year end", () => {
    expect(startMonthRange("2026-02-15")).toEqual({ min: "2024-02", max: "2025-10" });
  });

  test("the sample SIP's start month (August 2025) is inside the range on 2 Nov 2026", () => {
    const { min, max } = startMonthRange("2026-11-02");
    expect("2025-08" >= min && "2025-08" <= max).toBe(true);
  });
});

describe("startMonthOptions", () => {
  test("lists every month in the range, newest first", () => {
    const months = startMonthOptions("2026-11-02");

    expect(months).toHaveLength(21);
    expect(months[0]).toBe("2026-07");
    expect(months[months.length - 1]).toBe("2024-11");
    expect(months).toContain("2025-08");
  });
});

describe("parseWholeNumber", () => {
  test("reads digits, with Indian commas, spaces and a rupee sign", () => {
    expect(parseWholeNumber("5000")).toBe(5000);
    expect(parseWholeNumber("5,000")).toBe(5000);
    expect(parseWholeNumber(" ₹1,00,000 ")).toBe(100000);
  });

  test("refuses anything that is not a whole number", () => {
    expect(parseWholeNumber("")).toBeNull();
    expect(parseWholeNumber("abc")).toBeNull();
    expect(parseWholeNumber("5000.5")).toBeNull();
    expect(parseWholeNumber("-100")).toBeNull();
    expect(parseWholeNumber("12e3")).toBeNull();
  });
});

describe("validateSetup", () => {
  const good = { schemeCode: 118955, startMonth: "2025-08", amount: "5,000", day: "5" };

  test("a good form gives a request and no errors", () => {
    expect(validateSetup(good, "2026-11-02")).toEqual({
      errors: {},
      request: { schemeCode: 118955, startMonth: "2025-08", monthlyAmount: 5000, sipDay: 5 },
    });
  });

  test("no fund picked: the fund error", () => {
    const r = validateSetup({ ...good, schemeCode: null }, "2026-11-02");
    expect(r.errors).toEqual({ fund: true });
    expect(r.request).toBeNull();
  });

  test("a month too recent (3 months ago) or too old (25 months ago) or empty: the start error", () => {
    expect(validateSetup({ ...good, startMonth: "2026-08" }, "2026-11-02").errors).toEqual({ start: true });
    expect(validateSetup({ ...good, startMonth: "2024-10" }, "2026-11-02").errors).toEqual({ start: true });
    expect(validateSetup({ ...good, startMonth: "" }, "2026-11-02").errors).toEqual({ start: true });
  });

  test("the first and last allowed months are accepted", () => {
    expect(validateSetup({ ...good, startMonth: "2026-07" }, "2026-11-02").errors).toEqual({});
    expect(validateSetup({ ...good, startMonth: "2024-11" }, "2026-11-02").errors).toEqual({});
  });

  test("amount: Rs 99 and Rs 1,00,001 are refused, Rs 100 and Rs 1,00,000 are accepted", () => {
    expect(validateSetup({ ...good, amount: "99" }, "2026-11-02").errors).toEqual({ amount: true });
    expect(validateSetup({ ...good, amount: "100001" }, "2026-11-02").errors).toEqual({ amount: true });
    expect(validateSetup({ ...good, amount: "100" }, "2026-11-02").errors).toEqual({});
    expect(validateSetup({ ...good, amount: "1,00,000" }, "2026-11-02").errors).toEqual({});
  });

  test("day: 0 and 29 are refused, 1 and 28 are accepted", () => {
    expect(validateSetup({ ...good, day: "0" }, "2026-11-02").errors).toEqual({ day: true });
    expect(validateSetup({ ...good, day: "29" }, "2026-11-02").errors).toEqual({ day: true });
    expect(validateSetup({ ...good, day: "1" }, "2026-11-02").errors).toEqual({});
    expect(validateSetup({ ...good, day: "28" }, "2026-11-02").errors).toEqual({});
  });

  test("every wrong field is reported at once", () => {
    const r = validateSetup({ schemeCode: null, startMonth: "", amount: "", day: "" }, "2026-11-02");
    expect(r.errors).toEqual({ fund: true, start: true, amount: true, day: true });
  });
});

describe("checkSipRequest (the server side of the same rules)", () => {
  const good = { schemeCode: 118955, startMonth: "2025-08", monthlyAmount: 5000, sipDay: 5 };

  test("accepts the sample SIP", () => {
    expect(checkSipRequest(good, "2026-11-02")).toEqual({ ok: true, request: good });
  });

  test("names every wrong field", () => {
    const r = checkSipRequest({ schemeCode: 0, startMonth: "2026-10", monthlyAmount: 50, sipDay: 31 }, "2026-11-02");
    expect(r).toEqual({ ok: false, fields: ["fund", "start", "amount", "day"] });
  });

  test("refuses a body that is not an object, or has the wrong kinds of values", () => {
    expect(checkSipRequest(null, "2026-11-02")).toEqual({ ok: false, fields: ["fund", "start", "amount", "day"] });
    expect(checkSipRequest({ ...good, monthlyAmount: "5000" }, "2026-11-02")).toEqual({ ok: false, fields: ["amount"] });
    expect(checkSipRequest({ ...good, startMonth: "August 2025" }, "2026-11-02")).toEqual({ ok: false, fields: ["start"] });
  });

  test("refuses a month that is not a real month", () => {
    expect(checkSipRequest({ ...good, startMonth: "2025-13" }, "2026-11-02")).toEqual({ ok: false, fields: ["start"] });
  });
});
