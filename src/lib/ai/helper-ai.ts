import OpenAI from "openai";
import type { Lang } from "@/lib/copy/dictionary";
import type { Facts } from "@/lib/sip/facts";

/**
 * The AI job (ADR-0001, ADR-0008): answer a follow-up question. The reason is written by code, not by the AI.
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

/** What the model says a follow-up question is asking for. Code uses it as a second lock after its own patterns. */
export type Intent = "facts" | "advice" | "prediction" | "unrelated";

async function askForText(system: string, user: string): Promise<{ text: string; offTopic?: boolean; intent?: Intent } | null> {
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
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}") as { text?: unknown; offTopic?: unknown; intent?: unknown };
    if (typeof parsed.text !== "string") return null;
    const intent = (["facts", "advice", "prediction", "unrelated"] as const).find((i) => i === parsed.intent);
    return { text: parsed.text.trim(), offTopic: parsed.offTopic === true, intent };
  } catch {
    return null;
  }
}

/** An answer to a follow-up question. The model also says what the question asks for, as a second lock after the patterns in code. */
export async function answerFollowup(args: {
  facts: Facts;
  question: string;
  lang: Lang;
  exitLoadAbout: string;
}): Promise<{ text: string; offTopic: boolean; intent: Intent } | null> {
  const system = `You answer a first-time mutual fund investor's question about their own SIP, using only the FACTS. Write in ${LANGUAGE[args.lang]}.

${RULES}
- First decide what the question is asking for, and put it in "intent":
  - "advice": it asks what the person should do, or whether something is wise, sensible, safe, right, better or worth it, or which fund to pick, buy, sell, switch, keep or stop.
  - "prediction": it asks what will happen, when, how long until, how many months until, or how much the value will be.
  - "unrelated": it is not about this SIP, its numbers, what happened to it, or how SIPs and NAVs work.
  - "facts": anything else.
- For "advice", "prediction" and "unrelated", reply with an empty text: {"intent": "advice", "text": ""}. Do not answer a question that asks for advice or a prediction, even by stating the facts around it.
- For "facts", answer in 1 to 3 short sentences, at most 70 words.
- Write every sentence in the language asked for. Do not mix languages.
- "invested", "instalmentsPaid" and "monthlyAmount" are about the whole SIP. "invested" is a total over all the instalments: never call it this month's. Only the "thisMonth" moves belong to the month.
- About stopping, you may use only these facts: stopping ends future instalments, and the money already in stays in the fund until the person withdraws it. Never say whether stopping is a good or bad idea.
- About an exit load: many funds charge one on units withdrawn within a year, often 1%, and the fund's own page has the exact rule. You do not know this fund's rule, so never say this fund charges it. If you give a rupee figure, say it is only what 1% of the value would be, about ${args.exitLoadAbout}.
Answer as JSON: {"intent": "facts", "text": "..."}`;
  const user = `FACTS\n${factSheet(args.facts, { exitLoadAbout: args.exitLoadAbout })}\n\nQUESTION: ${args.question}`;
  const reply = await askForText(system, user);
  if (!reply) return null;
  const intent = reply.intent ?? (reply.offTopic ? "unrelated" : "facts");
  return { text: reply.text, offTopic: reply.offTopic === true || intent === "unrelated", intent };
}
