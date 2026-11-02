import { describe, expect, test } from "vitest";
import { todayInIndia } from "./today";

describe("todayInIndia", () => {
  test("late evening UTC is already the next day in India (UTC+5:30)", () => {
    expect(todayInIndia(new Date("2026-11-01T20:00:00Z"))).toBe("2026-11-02");
  });

  test("early morning UTC is the same day in India", () => {
    expect(todayInIndia(new Date("2026-11-02T03:00:00Z"))).toBe("2026-11-02");
  });

  test("just before 18:30 UTC is still the same day in India", () => {
    expect(todayInIndia(new Date("2026-11-02T18:29:00Z"))).toBe("2026-11-02");
    expect(todayInIndia(new Date("2026-11-02T18:31:00Z"))).toBe("2026-11-03");
  });
});
