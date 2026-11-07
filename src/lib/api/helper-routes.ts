import { z } from "zod";
import { answerFollowup as answerFollowupWithAi } from "@/lib/ai/helper-ai";
import { copy, LANGS, t } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { allowedNumbers, checkReply } from "@/lib/guard/reply";
import { classifyQuestion } from "@/lib/guard/question";
import { detectFactsTopic, detectFundTypes, detectLearnTopic, exitLoadAbout, explain, factsAnswer, fundTypesAnswer, GUESSES, reasonLine } from "@/lib/helper";
import type { FundTypeId } from "@/lib/helper";
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
  /** Always "template": the reason is written by code. */
  source: "template";
  case: string;
  misread: boolean;
};

export type FollowupResponse = {
  text: string;
  /** "ai": answered from your numbers and checked. "safe": a fixed safe answer. "template": written by code. */
  source: ReplySource;
  kind: "answered" | "advice" | "prediction" | "off-topic" | "check-failed" | "basics" | "own-facts" | "facts";
  link?: string;
  /** Version 2: after the safe answer to an advice question, the person can open their own facts in one tap. */
  offer?: "own-facts";
  /** Version 2: a fund-type basic (written by code), and the one to offer next. */
  basic?: { id: FundTypeId; next: FundTypeId | null };
  /** A general definition from a learn card (the Nifty 50, an exit load): the AMFI page path for its link. */
  learnPath?: string;
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

/**
 * The reason for a guess. It is always written by code, from the template for the case (ADR-0008). The AI is not
 * called for it: a reason must read the same, and say only what the facts show, on every run.
 */
export function reasonReply(facts: Facts, guess: Guess, lang: Lang): ReasonResponse {
  const plain = explain(facts, guess, lang);
  return { opening: plain.opening, reason: plain.reason, source: "template", case: plain.case, misread: plain.misread };
}

/**
 * The safe answer to a question that asks for advice: one short line and the small pointer to a SEBI-registered
 * adviser and AMFI, nothing else. The question is not discussed. The "Show me my facts" button is added by the screen.
 */
function adviceReply(lang: Lang): FollowupResponse {
  const text = [t(copy.followup.safeAdvice, lang), t(copy.followup.adviser, lang)].join(" ");
  return { text, source: "safe", kind: "advice", link: "amfi", offer: "own-facts" };
}

/** The safe answer to a question about the future: its own one line, then the same small pointer. */
function predictionReply(lang: Lang): FollowupResponse {
  const text = [t(copy.followup.safePredict, lang), t(copy.followup.adviser, lang)].join(" ");
  return { text, source: "safe", kind: "prediction", link: "amfi" };
}

/**
 * A follow-up answer. Two locks stand before a written reply. First, patterns in code catch advice and prediction
 * questions before any AI call. Second, the AI says what the question asks for, and a question it reads as advice
 * or a prediction gets the same safe answer, so a phrasing the patterns miss is still caught.
 * `ask` is the AI call. Tests pass a stand-in.
 */
export async function followupReply(
  facts: Facts,
  question: string,
  lang: Lang,
  useAi: boolean,
  ask: typeof answerFollowupWithAi = answerFollowupWithAi,
): Promise<FollowupResponse> {
  const kind = classifyQuestion(question);
  if (kind === "advice") return adviceReply(lang);
  if (kind === "prediction") return predictionReply(lang);

  // Fund-type basics (small, mid, large cap, hybrid) are written by code from AMFI definitions: no AI, no pick.
  const named = detectFundTypes(question);
  if (named.length > 0) {
    const answer = fundTypesAnswer(named, lang);
    return { text: answer.text, source: "template", kind: "basics", basic: { id: answer.id, next: answer.next } };
  }

  // General definitions (the Nifty 50, an exit load) come from the learn cards, not from the AI.
  const card = detectLearnTopic(question);
  if (card) return { text: t(card.body, lang), source: "template", kind: "basics", learnPath: card.path };

  // "Why is my value below what I put in" and "did my fund fall more than the market": written by code from the facts.
  const topic = detectFactsTopic(question);
  if (topic) return { text: factsAnswer(facts, topic, lang), source: "template", kind: "facts" };

  const checkFailed: FollowupResponse = {
    text: t(copy.followup.checkFailed, lang, { line: reasonLine(facts, lang) }),
    source: "safe",
    kind: "check-failed",
  };
  if (!useAi) return checkFailed;
  try {
    const load = exitLoadAbout(facts);
    const reply = await ask({ facts, question, lang, exitLoadAbout: formatRupees(load) });
    if (!reply) return checkFailed;
    if (reply.intent === "advice") return adviceReply(lang);
    if (reply.intent === "prediction") return predictionReply(lang);
    if (reply.offTopic || !reply.text) return { text: t(copy.followup.safeOff, lang), source: "safe", kind: "off-topic" };
    const check = checkReply(reply.text, allowedNumbers(facts, [load, 1, 12]), facts);
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
