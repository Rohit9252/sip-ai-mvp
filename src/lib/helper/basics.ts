import { learnCards } from "@/lib/copy/learn";
import type { LearnCard } from "@/lib/copy/learn";
import type { Case } from "./cases";

/**
 * The basics are shown one at a time inside the answer (version 2, E3's fix), starting with the one that best
 * explains this person's case. Every basic is still reachable, one tap at a time.
 */
const FIRST_FOR_CASE: Record<Case, string> = {
  SAME: "nifty",
  FUND_LESS: "nifty",
  FUND_MORE: "below",
  MARKET_UP: "below",
  FUND_UP: "units",
};

export function basicsFor(c: Case | null): LearnCard[] {
  if (!c) return [...learnCards];
  const first = FIRST_FOR_CASE[c];
  return [...learnCards].sort((a, b) => Number(b.id === first) - Number(a.id === first));
}
