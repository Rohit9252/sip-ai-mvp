/**
 * A small per-visitor limit on AI calls, kept in memory on one server instance (TODO T3.4). Nothing about the
 * visitor is stored beyond a count for the window. It protects the API key from a runaway loop, not from a
 * determined attacker.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_CALLS = 40;
const seen = new Map<string, { start: number; count: number }>();

export function visitorOf(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export function allowCall(visitor: string, now = Date.now()): boolean {
  const entry = seen.get(visitor);
  if (!entry || now - entry.start > WINDOW_MS) {
    seen.set(visitor, { start: now, count: 1 });
    if (seen.size > 5000) seen.clear();
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_CALLS;
}
