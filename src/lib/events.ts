import { track as vercelTrack } from "@vercel/analytics";

/**
 * Anonymous events (TODO T4.2). Only names and small labels: never a question, an answer, a fund or an amount.
 * They feed "falls read correctly" and the before and after test.
 */
export type EventName =
  | "sip_opened"
  | "setback_shown"
  | "guess_chosen"
  | "reason_shown"
  | "followup_asked"
  | "got_it"
  | "tester_answer";

export function track(name: EventName, props: Record<string, string | number | boolean> = {}) {
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics is a convenience: the app works without it.
  }
}
