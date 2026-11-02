import { navClient } from "@/lib/nav";
import { buildSip, SipServiceError } from "@/lib/api/sip-service";
import { todayInIndia } from "@/lib/api/today";
import type { ApiError } from "@/lib/api/types";
import { checkSipRequest } from "@/lib/setup/rules";

const STATUS: Record<ApiError["error"], number> = {
  load: 503,
  "not-found": 404,
  "fund-too-new": 422,
  "bad-input": 400,
};

/**
 * POST /api/sip with { schemeCode, startMonth, monthlyAmount, sipDay }.
 * Answers with the month-end snapshots, the setback, the facts and the daily series (see SipResponse).
 * The "Try a sample SIP" button sends SAMPLE_SIP to this same route.
 */
export async function POST(request: Request) {
  const today = todayInIndia();

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // An unreadable body is checked like any other wrong body, below.
  }
  const checked = checkSipRequest(body, today);
  if (!checked.ok) {
    return Response.json({ error: "bad-input", fields: checked.fields } satisfies ApiError, { status: STATUS["bad-input"] });
  }

  try {
    return Response.json(await buildSip(navClient, checked.request, today));
  } catch (error) {
    if (error instanceof SipServiceError) {
      const body: ApiError = error.kind === "bad-input" ? { error: "bad-input", fields: [] } : { error: error.kind } as ApiError;
      return Response.json(body, { status: STATUS[error.kind] });
    }
    throw error;
  }
}
