import { describe, expect, test } from "vitest";
import { copy, fillTemplate, LANGS, MONTH_NAMES, monthName, t } from "./dictionary";
import type { Entry } from "./dictionary";

/** Every entry in the dictionary, with its name, for the checks that must hold for all of them. */
function allEntries(): [string, Entry][] {
  const out: [string, Entry][] = [];
  for (const [group, entries] of Object.entries(copy)) {
    for (const [key, entry] of Object.entries(entries)) out.push([`${group}.${key}`, entry as Entry]);
  }
  return out;
}

const braces = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("the dictionary", () => {
  test("every entry has text in English, Hindi and Hinglish", () => {
    for (const [name, entry] of allEntries()) {
      for (const lang of LANGS) expect(entry[lang].trim(), `${name} in ${lang}`).not.toBe("");
    }
  });

  test("the three languages use the same {braces} in every entry", () => {
    for (const [name, entry] of allEntries()) {
      expect(braces(entry.hi), `${name} (Hindi)`).toEqual(braces(entry.en));
      expect(braces(entry.hn), `${name} (Hinglish)`).toEqual(braces(entry.en));
    }
  });

  test("no em dashes anywhere in the copy", () => {
    const emDash = String.fromCharCode(0x2014);
    for (const [name, entry] of allEntries()) {
      for (const lang of LANGS) expect(entry[lang].includes(emDash), `${name} in ${lang}`).toBe(false);
    }
  });

  test("no copy uses the words the glossary says to avoid", () => {
    const avoid = /\b(dip|crash|principal|balance|benchmark|kyun)\b/i;
    for (const [name, entry] of allEntries()) {
      for (const lang of LANGS) expect(avoid.test(entry[lang]), `${name} in ${lang}`).toBe(false);
    }
  });

  test("no copy gives advice or a prediction (the words a written reply may never use)", () => {
    // The fixed safe answers talk about advice and prediction on purpose, so they are checked by name below.
    const nudges = /(you should|i recommend|keep going|stay invested|don't worry|will recover|will rise|will go up|will come back)/i;
    for (const [name, entry] of allEntries()) {
      if (name.startsWith("followup.safe")) continue;
      expect(nudges.test(entry.en), name).toBe(false);
    }
  });

  test("has twelve month names in each language", () => {
    for (const lang of LANGS) expect(MONTH_NAMES[lang]).toHaveLength(12);
  });
});

describe("fillTemplate", () => {
  test("fills named braces", () => {
    expect(fillTemplate("{n} instalments", { n: 8 })).toBe("8 instalments");
  });

  test("a money value with its own rupee sign replaces the template's rupee sign, not doubles it", () => {
    expect(fillTemplate("Your ₹{invested} is now ₹{value}.", { invested: "₹40,000", value: "₹35,785" })).toBe(
      "Your ₹40,000 is now ₹35,785.",
    );
  });

  test("a plain number after a rupee sign keeps the sign", () => {
    expect(fillTemplate("₹{amount} a month", { amount: "5,000" })).toBe("₹5,000 a month");
  });

  test("a brace with no value is left in place so the gap is visible", () => {
    expect(fillTemplate("as of {date}", {})).toBe("as of {date}");
  });
});

describe("t and monthName", () => {
  test("t picks the language and fills the braces", () => {
    expect(t(copy.common.source, "hi", { date: "10 Apr 2026" })).toBe("NAV: AMFI (mfapi.in), 10 Apr 2026 तक");
  });

  test("monthName writes the full month and the year in the language", () => {
    expect(monthName("2026-03", "en")).toBe("March 2026");
    expect(monthName("2026-03", "hi")).toBe("मार्च 2026");
    expect(monthName("2026-03", "hn")).toBe("March 2026");
  });
});
