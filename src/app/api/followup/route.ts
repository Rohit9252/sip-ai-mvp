import { factsFor, followupReply, parseLang } from "@/lib/api/helper-routes";
import { allowCall, visitorOf } from "@/lib/api/rate-limit";
import { SipServiceError } from "@/lib/api/sip-service";

const MAX_QUESTION = 300;

/**
 * POST /api/followup with { request, question, lang }. Advice and prediction questions get a fixed safe answer
 * before any AI call. Other questions are answered from the facts and checked in code (FollowupResponse).
 * Questions and answers are not stored.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { request?: unknown; question?: unknown; lang?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, MAX_QUESTION) : "";
  if (!question) return Response.json({ error: "bad-input" }, { status: 400 });
  try {
    const found = await factsFor(body?.request);
    if (!found) return Response.json({ error: "bad-input" }, { status: 400 });
    const useAi = allowCall(visitorOf(request));
    return Response.json(await followupReply(found.facts, question, parseLang(body?.lang), useAi));
  } catch (error) {
    if (error instanceof SipServiceError) return Response.json({ error: error.kind }, { status: 503 });
    throw error;
  }
}
