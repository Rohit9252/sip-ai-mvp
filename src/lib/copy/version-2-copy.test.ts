import { describe, expect, test } from "vitest";
import { checkReply, numbersIn } from "@/lib/guard/reply";
import { copy, LANGS } from "./dictionary";
import type { Entry } from "./dictionary";
import { fundTypeCopy } from "./fund-types";
import { ownFactsCopy } from "./own-facts";
import { exitLoadLearn, learnCards, learnCopy } from "./learn";

/** The copy added in version 2, each line with its name. */
function newEntries(): [string, Entry][] {
  const out: [string, Entry][] = [
    ["followup.safeAdvice", copy.followup.safeAdvice],
    ["followup.safePredict", copy.followup.safePredict],
    ["followup.offerButton", copy.followup.offerButton],
    ["followup.qTypes", copy.followup.qTypes],
    ["helper.checkAsk", copy.helper.checkAsk],
  ];
  for (const [key, entry] of Object.entries(ownFactsCopy)) out.push([`ownFacts.${key}`, entry]);
  for (const [key, value] of Object.entries(fundTypeCopy)) {
    if ("en" in value) out.push([`fundTypes.${key}`, value as Entry]);
    else for (const [id, entry] of Object.entries(value)) out.push([`fundTypes.${key}.${id}`, entry as Entry]);
  }
  out.push(["learn.another", learnCopy.another]);
  out.push(["learn.tag", learnCopy.tag]);
  out.push(["learn.exitLoad.body", exitLoadLearn.body]);
  for (const card of learnCards) out.push([`learn.${card.id}`, card.body]);
  return out;
}

describe("version 2 copy: three languages, plain, and never advice", () => {
  test("every line is in English, Hindi and Hinglish", () => {
    for (const [name, entry] of newEntries()) {
      for (const lang of LANGS) expect(entry[lang].trim(), `${name} in ${lang}`).not.toBe("");
    }
  });

  test("no em dashes and no semicolons", () => {
    const emDash = String.fromCharCode(0x2014);
    for (const [name, entry] of newEntries()) {
      for (const lang of LANGS) {
        expect(entry[lang].includes(emDash), `${name} in ${lang} (em dash)`).toBe(false);
        expect(entry[lang].includes(";"), `${name} in ${lang} (semicolon)`).toBe(false);
      }
    }
  });

  test("no advice and no prediction, by the same patterns that check every written reply", () => {
    for (const [name, entry] of newEntries()) {
      for (const lang of LANGS) {
        const text = entry[lang];
        // The numbers are allowed here: this test is about the words.
        const check = checkReply(text, new Set(numbersIn(text)));
        expect(check.problems.filter((p) => p === "advice" || p === "prediction"), `${name} in ${lang}`).toEqual([]);
      }
    }
  });

  test("none of the English lines uses a word that tells a person what to do", () => {
    const orders = /\b(should|must|ought|recommend|suggest|advise|better|best|safer|safest|buy|invest in)\b/i;
    for (const [name, entry] of newEntries()) expect(orders.test(entry.en), name).toBe(false);
  });
});
