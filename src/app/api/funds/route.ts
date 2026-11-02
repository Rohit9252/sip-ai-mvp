import { NavError, navClient } from "@/lib/nav";
import type { ApiError, FundsResponse } from "@/lib/api/types";

/** Most results shown in the list. Search is by name, so a longer list is rarely what the person wants. */
const MAX_RESULTS = 15;

/** GET /api/funds?q=hdfc flexi: Direct, Growth funds whose name matches. Fewer than two letters gives an empty list. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  try {
    const funds = (await navClient.searchFunds(q)).slice(0, MAX_RESULTS);
    return Response.json({ funds } satisfies FundsResponse);
  } catch (error) {
    if (error instanceof NavError) return Response.json({ error: "load" } satisfies ApiError, { status: 503 });
    throw error;
  }
}
