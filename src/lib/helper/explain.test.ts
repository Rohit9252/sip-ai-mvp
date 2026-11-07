import { describe, expect, test } from "vitest";
import { FactsSchema, formatDate, formatMonth, formatPercent, formatRupees } from "@/lib/sip";
import type { Facts } from "@/lib/sip";
import { askQuestion, explain, reasonLine, signedPercent } from "./explain";

/** Facts for a made-up setback month. Money in whole rupees, moves in percent. */
function makeFacts(args: {
  fund: number;
  market: number;
  invested?: number;
  value?: number;
  monthsKept?: number;
  date?: string;
}): Facts {
  const invested = args.invested ?? 40000;
  const value = args.value ?? 35785;
  const date = args.date ?? "2026-03-31";
  const pct = (n: number) => ({ pct: n, text: formatPercent(n), absText: formatPercent(Math.abs(n)) });
  const move = {
    fromDate: "2026-02-27",
    fromText: formatDate("2026-02-27"),
    toDate: date,
    toText: formatDate(date),
    fundMove: pct(args.fund),
    marketMove: pct(args.market),
  };
  return FactsSchema.parse({
    hasSetback: true,
    fund: { schemeCode: 118955, name: "Made-up Fund - Direct Plan - Growth" },
    market: { schemeCode: 120716, name: "Made-up Market Index Fund - Direct Plan - Growth" },
    sip: {
      monthlyAmount: { amount: 5000, text: formatRupees(5000) },
      sipDay: 5,
      startMonth: "2025-08",
      startMonthText: formatMonth("2025-08"),
    },
    monthNumber: 8,
    monthsKept: args.monthsKept ?? 8,
    date,
    dateText: formatDate(date),
    invested: { amount: invested, text: formatRupees(invested) },
    value: { amount: value, text: formatRupees(value) },
    gain: {
      amount: value - invested,
      text: formatRupees(value - invested),
      absText: formatRupees(Math.abs(value - invested)),
    },
    monthMove: move,
    sinceStartMove: move,
    source: "AMFI, via mfapi.in",
  });
}

/* The sample SIP's setback (docs/reference/sample-sip.md): invested 40,000, value 35,785, fund -11.7%, market -11.3%. */
const sample = makeFacts({ fund: -11.7, market: -11.3 });

describe("askQuestion", () => {
  test("puts the person's own rupees in the question, in each language", () => {
    expect(askQuestion(sample, "en")).toBe("Your ₹40,000 is now ₹35,785. What do you think happened?");
    expect(askQuestion(sample, "hi")).toBe("आपके ₹40,000 अब ₹35,785 हैं। आपको क्या लगता है, क्या हुआ?");
    expect(askQuestion(sample, "hn")).toBe("Aapke ₹40,000 ab ₹35,785 hain. Aapko kya lagta hai, kya hua?");
  });
});

describe("explain: the sample SIP (SAME)", () => {
  test("'my fund' gets the opener and the SAME reason with 11.3% and 11.7%, and it is a misread", () => {
    const x = explain(sample, "fund", "en");

    expect(x.case).toBe("SAME");
    expect(x.misread).toBe(true);
    expect(x.opening).toEqual(["This fall isn't just your fund."]);
    expect(x.reason).toBe(
      "This month the whole market (Nifty 50) fell 11.3%. Your fund fell 11.7%, about the same as the market.",
    );
  });

  test("'the whole market' reads it right and is not a misread", () => {
    const x = explain(sample, "market", "en");

    expect(x.misread).toBe(false);
    expect(x.opening).toEqual(["You read it right."]);
  });

  test("'I don't know' gets two opening lines before the reason", () => {
    const x = explain(sample, "dunno", "en");

    expect(x.opening).toEqual(["That's a common question.", "Your money moves with the share market."]);
    expect(x.misread).toBe(false);
  });

  test("'not worth it' starts with the person's own months and rupees, then the same reason", () => {
    const x = explain(sample, "worth", "en");

    expect(x.opening).toEqual(["Your 8 months so far: you've put in ₹40,000, and today it's worth ₹35,785."]);
    expect(x.reason).toBe(explain(sample, "fund", "en").reason);
  });

  test("Hindi and Hinglish use the same numbers", () => {
    const hi = explain(sample, "fund", "hi");
    const hn = explain(sample, "fund", "hn");

    expect(hi.opening).toEqual(["ये गिरावट सिर्फ़ आपके fund की नहीं है।"]);
    expect(hi.reason).toBe("इस महीने पूरा market (Nifty 50) 11.3% गिरा। आपका fund 11.7% गिरा, लगभग market जितना ही।");
    expect(hn.opening).toEqual(["Ye girawat sirf aapke fund ki nahi hai."]);
    expect(hn.reason).toBe("Is mahine poora market (Nifty 50) 11.3% gira. Aapka fund 11.7% gira, lagbhag market jitna hi.");
  });
});

describe("explain: the other four cases", () => {
  test("FUND_MORE: the fund fell more than 1.5 points more", () => {
    const x = explain(makeFacts({ fund: -8.0, market: -3.0 }), "market", "en");

    expect(x.case).toBe("FUND_MORE");
    expect(x.opening).toEqual(["Partly right."]);
    expect(x.reason).toBe(
      "This month the whole market (Nifty 50) fell 3.0%. Your fund fell more, 8.0%. So part of this fall is the market and part is your fund.",
    );
  });

  test("FUND_LESS: the fund fell more than 1.5 points less", () => {
    const x = explain(makeFacts({ fund: -1.0, market: -6.0 }), "fund", "en");

    expect(x.case).toBe("FUND_LESS");
    expect(x.misread).toBe(true);
    expect(x.reason).toBe("This month the whole market (Nifty 50) fell 6.0%. Your fund fell less, 1.0%.");
  });

  test("MARKET_UP: the market rose and the fund fell, so blaming the fund is a correct read", () => {
    const x = explain(makeFacts({ fund: -2.5, market: 3.6 }), "fund", "en");

    expect(x.case).toBe("MARKET_UP");
    expect(x.misread).toBe(false);
    expect(x.opening).toEqual(["You read it right."]);
    expect(x.reason).toBe(
      "This month the whole market (Nifty 50) rose 3.6%, but your fund fell 2.5%. This fall is in your fund's price, not in the whole market.",
    );
  });

  test("FUND_UP: the fund rose but the value is still below invested, with the gap in rupees", () => {
    const x = explain(makeFacts({ fund: 2.1, market: -1.0, invested: 20000, value: 19826 }), "fund", "en");

    expect(x.case).toBe("FUND_UP");
    expect(x.misread).toBe(true);
    expect(x.opening).toEqual(["Your fund didn't fall this month."]);
    expect(x.reason).toBe(
      "This month the whole market (Nifty 50) fell 1.0%, and your fund rose 2.1%. Your value is still ₹174 below what you put in. Some of your instalments bought units at a higher price than today's.",
    );
  });

  test("a gap above one lakh uses Indian grouping", () => {
    const x = explain(makeFacts({ fund: 1.0, market: 1.0, invested: 500000, value: 380000 }), "dunno", "en");

    expect(x.reason).toContain("₹1,20,000 below what you put in");
  });
});

describe("explain: the two bars", () => {
  test("show the signed moves, with the bigger move filling the bar", () => {
    const { bars } = explain(sample, "fund", "en");

    expect(bars.market).toMatchObject({ label: "Whole market (Nifty 50)", text: "-11.3%", direction: "down" });
    expect(bars.fund).toMatchObject({ label: "Your fund", text: "-11.7%", direction: "down" });
    expect(bars.fund.widthPct).toBe(100);
    expect(bars.market.widthPct).toBeCloseTo(96.6, 1);
  });

  test("a small move does not fill the bar (the scale never goes below 5 points)", () => {
    const { bars } = explain(makeFacts({ fund: -1.0, market: -0.5 }), "fund", "en");

    expect(bars.fund.widthPct).toBe(20);
    expect(bars.market.widthPct).toBe(10);
  });

  test("a rise shows a plus sign and the 'up' direction", () => {
    const { bars } = explain(makeFacts({ fund: -2.5, market: 3.6 }), "fund", "en");

    expect(bars.market).toMatchObject({ text: "+3.6%", direction: "up" });
    expect(bars.fund).toMatchObject({ text: "-2.5%", direction: "down" });
  });

  test("labels follow the language", () => {
    const { bars } = explain(sample, "fund", "hi");

    expect(bars.market.label).toBe("पूरा market (Nifty 50)");
    expect(bars.fund.label).toBe("आपका fund");
  });
});

describe("signedPercent", () => {
  test("adds a plus to a rise, keeps the minus on a fall, and shows a flat move as 0.0%", () => {
    expect(signedPercent({ pct: 3.6, text: "3.6%", absText: "3.6%" })).toBe("+3.6%");
    expect(signedPercent({ pct: -3.6, text: "-3.6%", absText: "3.6%" })).toBe("-3.6%");
    expect(signedPercent({ pct: 0, text: "0.0%", absText: "0.0%" })).toBe("0.0%");
  });
});

describe("reasonLine (what stays next to the value after 'Got it')", () => {
  test("names the month and the two moves, in each language", () => {
    expect(reasonLine(sample, "en")).toBe("March 2026: market fell 11.3%, your fund fell 11.7%.");
    expect(reasonLine(sample, "hi")).toBe("मार्च 2026: market 11.3% गिरा, आपका fund 11.7% गिरा।");
    expect(reasonLine(sample, "hn")).toBe("March 2026: market 11.3% gira, aapka fund 11.7% gira.");
  });

  test("says 'rose' for a rise", () => {
    expect(reasonLine(makeFacts({ fund: -2.5, market: 3.6 }), "en")).toBe(
      "March 2026: market rose 3.6%, your fund fell 2.5%.",
    );
    expect(reasonLine(makeFacts({ fund: -2.5, market: 3.6 }), "hn")).toBe(
      "March 2026: market 3.6% badha, aapka fund 2.5% gira.",
    );
  });
});
