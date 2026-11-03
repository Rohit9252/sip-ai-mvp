import { factsFor, parseGuess, parseLang, reasonReply } from "@/lib/api/helper-routes";
import { allowCall, visitorOf } from "@/lib/api/rate-limit";
import { SipServiceError } from "@/lib/api/sip-service";

/**
 * POST /api/reason with { request, guess, lang }. Answers with the opening, the reason and where the words came from
 * (ReasonResponse). The numbers are worked out here from AMFI NAVs; the model writes words only (ADR-0001).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { request?: unknown; guess?: unknown; lang?: unknown } | null;
  const guess = parseGuess(body?.guess);
  if (!guess) return Response.json({ error: "bad-input" }, { status: 400 });
  try {
    const found = await factsFor(body?.request);
    if (!found) return Response.json({ error: "bad-input" }, { status: 400 });
    // Over the limit, the person still gets the reason: the template, with no AI call.
    const useAi = allowCall(visitorOf(request));
    return Response.json(await reasonReply(found.facts, guess, parseLang(body?.lang), useAi));
  } catch (error) {
    if (error instanceof SipServiceError) return Response.json({ error: error.kind }, { status: 503 });
    throw error;
  }
}
