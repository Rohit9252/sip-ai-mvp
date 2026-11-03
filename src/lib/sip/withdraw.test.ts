import { describe, expect, test } from "vitest";
import { withdrawal } from "./withdraw";

describe("withdrawal", () => {
  test("the sample at its setback: all of Rs 35,785 in month 8 carries about 1%, Rs 358", () => {
    // 35,785 x 0.01 = 357.85, rounds to 358; 35,785 - 358 = 35,427
    expect(withdrawal(35785, "2025-08-05", "2026-03-31")).toEqual({ amount: 35785, exitLoad: 358, youGet: 35427 });
  });

  test("a part withdrawal carries the load on that part only", () => {
    expect(withdrawal(10000, "2025-08-05", "2026-03-31")).toEqual({ amount: 10000, exitLoad: 100, youGet: 9900 });
  });

  test("a year or more after the first instalment, no load is estimated", () => {
    expect(withdrawal(10000, "2025-08-05", "2026-08-05").exitLoad).toBe(0);
  });

  test("refuses a broken amount", () => {
    expect(() => withdrawal(10.5, "2025-08-05", "2026-03-31")).toThrow(RangeError);
  });
});
