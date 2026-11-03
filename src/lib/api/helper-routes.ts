import { z } from "zod";
import { answerFollowup, writeReason } from "@/lib/ai/helper-ai";
import { copy, LANGS, t } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { allowedNumbers, checkReply } from "@/lib/guard/reply";
import { classifyQuestion } from "@/lib/guard/question";
import { explain, GUESSES, reasonLine } from "@/lib/helper";
import type { Guess } from "@/lib/helper";
import { navClient } from "@/lib/nav";
import { checkSipRequest } from "@/lib/setup/rules";
import type { SipRequest } from "@/lib/setup/rules";
import { formatRupees } from "@/lib/sip/format";
import type { Facts } from "@/lib/sip/facts";
import { buildSip } from "./sip-service";
import { todayInIndia } from "./today";

/**
 * The server side of the two AI jobs. The browser sends the SIP request, never the numbers: the facts are worked
 * out again here from AMFI NAVs (cached), so nobody can feed the model made-up numbers.
 */

export type ReplySource = "ai" | "template" | "safe";

export type ReasonResponse = {
  opening: string[];
  reason: string;
  /** "ai": written by the model and passed every check. "template": written by code. */
  source: Exclude<ReplySource, "safe">;
  case: string;
  misread: boolean;
};

export type FollowupResponse = {
  text: string;
  /** "ai": answered from your numbers and checked. "safe": a fixed safe answer. */
  source: Exclude<ReplySource, "template">;
  kind: "answered" | "advice" | "prediction" | "off-topic" | "check-failed";
  link?: string;
};

const LangSchema = z.enum(LANGS);

export async function factsFor(body: unknown): Promise<{ request: SipRequest; facts: Facts } | null> {
  const today = todayInIndia();
  const checked = checkSipRequest(body, today);
  if (!checked.ok) return null;
  const sip = await buildSip(navClient, checked.request, today);
  return sip.facts ? { request: checked.request, facts: sip.facts } : null;
}

export function parseLang(value: unknown): Lang {
  const parsed = LangSchema.safeParse(value);
  return parsed.success ? parsed.data : "en";
}

export function parseGuess(value: unknown): Guess | null {
  return (GUESSES as readonly string[]).includes(value as string) ? (value as Guess) : null;
}

/** The reason for a guess: the model's words if they pass every check, else the code's template. */
export async function reasonReply(facts: Facts, guess: Guess, lang: Lang, useAi: boolean): Promise<ReasonResponse> {
  const plain = explain(facts, guess, lang);
  const template: ReasonResponse = {
    opening: plain.opening,
    reason: plain.reason,
    source: "template",
    case: plain.case,
    misread: plain.misread,
  };
  if (!useAi) return template;
  try {
    const text = await writeReason({
      facts,
      guess,
      case: plain.case,
      misread: plain.misread,
      opening: plain.opening.join(" "),
      template: plain.reason,
      lang,
    });
    if (!text) return template;
    const check = checkReply(text, allowedNumbers(facts));
    if (!check.ok) {
      console.log(`reason: AI reply rejected (${check.problems.join(", ")}${check.badNumbers.length ? `: ${check.badNumbers.join(" ")}` : ""})`);
      return template;
    }
    return { ...template, reason: text, source: "ai" };
  } catch (error) {
    console.log(`reason: AI call failed (${error instanceof Error ? error.message : "unknown"})`);
    return template;
  }
}

/** About 1% of the value, the usual exit load inside a year. Worked out in code, labelled "about". */
export function exitLoadAbout(facts: Facts): number {
  return Math.round(facts.value.amount * 0.01);
}

/** A follow-up answer: advice and predictions get a fixed safe answer before any AI call. */
export async function followupReply(facts: Facts, question: string, lang: Lang, useAi: boolean): Promise<FollowupResponse> {
  const kind = classifyQuestion(question);
  if (kind === "advice") {
    return { text: `${t(copy.followup.safeAdvice, lang)} ${t(copy.followup.adviser, lang)}`, source: "safe", kind: "advice", link: "amfi" };
  }
  if (kind === "prediction") return { text: t(copy.followup.safePredict, lang), source: "safe", kind: "prediction" };

  const checkFailed: FollowupResponse = {
    text: t(copy.followup.checkFailed, lang, { line: reasonLine(facts, lang) }),
    source: "safe",
    kind: "check-failed",
  };
  if (!useAi) return checkFailed;
  try {
    const load = exitLoadAbout(facts);
    const reply = await answerFollowup({ facts, question, lang, exitLoadAbout: formatRupees(load) });
    if (!reply) return checkFailed;
    if (reply.offTopic || !reply.text) return { text: t(copy.followup.safeOff, lang), source: "safe", kind: "off-topic" };
    const check = checkReply(reply.text, allowedNumbers(facts, [load, 1, 12]));
    if (!check.ok) {
      console.log(`followup: AI reply rejected (${check.problems.join(", ")}${check.badNumbers.length ? `: ${check.badNumbers.join(" ")}` : ""})`);
      return checkFailed;
    }
    return { text: reply.text, source: "ai", kind: "answered" };
  } catch (error) {
    console.log(`followup: AI call failed (${error instanceof Error ? error.message : "unknown"})`);
    return checkFailed;
  }
}
