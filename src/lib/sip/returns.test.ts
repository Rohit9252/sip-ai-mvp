import { describe, expect, test } from "vitest";
import { describeReturns } from "./returns";

/*
 * "Total returns" under the value: an arrow, a sign, the rupees and the percent, in the same words every time.
 * Percent is the gain over what was invested, to one decimal. The tone drives the colour, but the arrow, the sign
 * and the words carry the meaning on their own.
 */
describe("describeReturns", () => {
  test("the sample SIP's setback: Rs 35,785 against Rs 40,000 is down Rs 4,215, 10.5% below invested", () => {
    // -4215 / 40000 = -10.5375%
    expect(describeReturns(-4215, 40000)).toEqual({
      tone: "loss",
      arrow: "down",
      amountText: "-₹4,215",
      percentText: "-10.5%",
    });
  });

  test("a gain gets a plus sign and an up arrow", () => {
    // 1600 / 5000 = 32%
    expect(describeReturns(1600, 5000)).toEqual({
      tone: "gain",
      arrow: "up",
      amountText: "+₹1,600",
      percentText: "+32.0%",
    });
  });

  test("exactly zero is flat: no arrow, no sign", () => {
    expect(describeReturns(0, 3000)).toEqual({ tone: "flat", arrow: null, amountText: "₹0", percentText: "0.0%" });
  });

  test("a gain too small to show in the percent still keeps its sign", () => {
    // 3 / 40000 = 0.0075%
    expect(describeReturns(3, 40000)).toMatchObject({ tone: "gain", amountText: "+₹3", percentText: "+0.0%" });
    expect(describeReturns(-3, 40000)).toMatchObject({ tone: "loss", amountText: "-₹3", percentText: "-0.0%" });
  });

  test("uses Indian grouping for large amounts", () => {
    expect(describeReturns(123456, 1000000)).toMatchObject({ amountText: "+₹1,23,456", percentText: "+12.3%" });
  });

  test("nothing invested yet gives 0.0% instead of a division by zero", () => {
    expect(describeReturns(0, 0)).toEqual({ tone: "flat", arrow: null, amountText: "₹0", percentText: "0.0%" });
  });
});
