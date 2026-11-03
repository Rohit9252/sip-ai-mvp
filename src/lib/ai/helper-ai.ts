import OpenAI from "openai";
import type { Lang } from "@/lib/copy/dictionary";
import type { Case, Guess } from "@/lib/helper/cases";
import type { Facts } from "@/lib/sip/facts";

/**
 * The two AI jobs (ADR-0001, ADR-0002): write the reason in words, and answer a follow-up question.
 * The model gets the facts object and writes words only. Every reply is checked in code by the route before it is
 * shown (src/lib/guard/reply.ts). A failure or a timeout falls back to text written by code.
 */

export const MODEL = "gpt-4.1-mini";
const TIMEOUT_MS = 12_000;

const LANGUAGE: Record<Lang, string> = {
  en: "simple English",
  hi: "simple Hindi in Devanagari script. Keep everyday English money words as people say them: SIP, fund, market, value, NAV, Nifty 50",
  hn: "Hinglish: Hindi written in Roman (English) letters, the way people text. Keep SIP, fund, market, value, NAV, Nifty 50 in English",
};

const RULES = `Rules you must never break:
- Never give advice: never say what the person should do (buy, sell, switch, stop, continue, keep going, stay invested, wait), never suggest or name another fund, never reassure ("don't worry").
- Never predict: never say what the fund, the market or the value will do next, or that it will recover.
- Use only numbers that appear in the FACTS, written exactly as they appear there. Do not calculate new numbers. Write digits as 0-9.
- No em dashes. Short sentences. Plain words a first-time investor understands.`;

function client() {
  return new OpenAI({ timeout: TIMEOUT_MS, maxRetries: 1 });
}

/** The facts the model may see, without anything it does not need. */
function factSheet(facts: Facts, extra: Record<string, string> = {}) {
  return JSON.stringify(
    {
      fund: facts.fund.name,
      market: "the whole market, measured by the Nifty 50 (UTI Nifty 50 Index Fund NAV)",
      monthlyAmount: facts.sip.monthlyAmount.text,
      sipStarted: facts.sip.startMonthText,
      monthOfSip: facts.monthNumber,
      instalmentsPaid: facts.monthsKept,
      monthEnd: facts.dateText,
      invested: facts.invested.text,
      value: facts.value.text,
      gapBelowInvested: facts.gain.amount < 0 ? facts.gain.absText : "none",
      thisMonth: {
        from: facts.monthMove.fromText,
        to: facts.monthMove.toText,
        fundMove: facts.monthMove.fundMove.text,
        marketMove: facts.monthMove.marketMove.text,
      },
      sinceStart: {
        from: facts.sinceStartMove.fromText,
        to: facts.sinceStartMove.toText,
        fundMove: facts.sinceStartMove.fundMove.text,
        marketMove: facts.sinceStartMove.marketMove.text,
      },
      ...extra,
    },
    null,
    2,
  );
}

const GUESS_WORDS: Record<Guess, string> = {
  fund: "my fund did badly",
  market: "the whole market fell",
  dunno: "I don't know",
  worth: "it doesn't feel worth it",
};

async function askForText(system: string, user: string): Promise<{ text: string; offTopic?: boolean } | null> {
  const response = await client().chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 300,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}") as { text?: unknown; offTopic?: unknown };
    if (typeof parsed.text !== "string") return null;
    return { text: parsed.text.trim(), offTopic: parsed.offTopic === true };
  } catch {
    return null;
  }
}

/**
 * The reason, in words. The template (written by code for this case) is the truth the model must keep: it may
 * reword it to start from the person's guess, but not change what it says.
 */
export async function writeReason(args: {
  facts: Facts;
  guess: Guess;
  case: Case;
  misread: boolean;
  opening: string;
  template: string;
  lang: Lang;
}): Promise<string | null> {
  const system = `You explain to a first-time mutual fund investor in India what happened to their own SIP in the month its value first fell below what they put in. Write in ${LANGUAGE[args.lang]}.

${RULES}
- The card already shows an opening line, written by code, that answers their guess. Do not repeat it, do not mention their guess, and never say whether they are right or wrong, or whether the SIP is worth it.
- Write the reason only: 1 or 2 short sentences, at most 45 words.
- Say what moved the value: their fund's move against the whole market's move (Nifty 50) this month. You may also say what they put in and what it is worth now.
- Keep the meaning of the REFERENCE exactly. Do not add causes that are not in the FACTS (no news, no reasons for the market falling).
- Talk to them as "you" (Hindi: "aap"). Warm and plain, like a calm friend, not a report.
Answer as JSON: {"text": "..."}`;
  const user = `FACTS
${factSheet(args.facts)}

THEIR GUESS: "${GUESS_WORDS[args.guess]}"
OPENING LINE ALREADY SHOWN: ${args.opening}
CASE: ${args.case}
REFERENCE (written by code, correct): ${args.template}`;
  const reply = await askForText(system, user);
  return reply?.text || null;
}

/** An answer to a follow-up question that is not advice or a prediction (those never reach the model). */
export async function answerFollowup(args: {
  facts: Facts;
  question: string;
  lang: Lang;
  exitLoadAbout: string;
}): Promise<{ text: string; offTopic: boolean } | null> {
  const system = `You answer a first-time mutual fund investor's question about their own SIP, using only the FACTS. Write in ${LANGUAGE[args.lang]}.

${RULES}
- Answer in 1 to 3 short sentences, at most 70 words.
- If the question asks what the person should do, or what will happen in the market, reply only with {"text": "", "offTopic": true}.
- If the question is not about this SIP, its numbers, what happened to it, or how SIPs and NAVs work, reply {"text": "", "offTopic": true}.
- About stopping, you may use only these facts: stopping ends future instalments; the money already in stays in the fund until the person withdraws it; many equity funds charge an exit load (often 1%) on units withdrawn within a year, and the fund's own page has the exact rule; on this value that is about ${args.exitLoadAbout}. Never say whether stopping is a good or bad idea.
Answer as JSON: {"text": "...", "offTopic": false}`;
  const user = `FACTS\n${factSheet(args.facts, { exitLoadAbout: args.exitLoadAbout })}\n\nQUESTION: ${args.question}`;
  const reply = await askForText(system, user);
  if (!reply) return null;
  return { text: reply.text, offTopic: reply.offTopic ?? false };
}
