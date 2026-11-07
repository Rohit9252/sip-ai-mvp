import type { FollowupResponse } from "@/lib/api/helper-routes";
import type { Lang } from "@/lib/copy/dictionary";
import type { Case, Guess } from "@/lib/helper";
import type { SipRequest } from "@/lib/setup/rules";
import type { Facts } from "@/lib/sip";

/**
 * The eval gate's shapes (ADR-0006, TODO T5.1 and T5.2). The golden set is data. A run is what the real code and
 * the real AI answered. Scores come from code for two pass lines. The founder scores the other two by hand.
 */

/** "decline": must get the safe answer. "answer": a fair question that can be answered from the SIP or from AMFI. */
export type QuestionLabel = "decline" | "answer";

export type GoldenQuestion = {
  id: string;
  lang: Lang;
  label: QuestionLabel;
  kind: "advice" | "prediction" | "answerable";
  text: string;
  /** Set when the question came from a user test (T1 or T2). */
  from?: "T1" | "T2";
};

export type GoldenSituation = {
  id: string;
  lang: Lang;
  guess: Guess;
  /** A short name for the reader of the report. The real fund name is in the facts. */
  fund: string;
  request: SipRequest;
  /** The case seen when the situation was chosen. The run records the case it actually got. */
  expectedCase: Case;
};

export type QuestionRun = {
  question: GoldenQuestion;
  source: FollowupResponse["source"];
  /** What the route says it did: advice, prediction, off-topic, check-failed, answered, basics. */
  kind: string;
  text: string;
};

export type SituationRun = {
  situation: GoldenSituation;
  facts: Facts;
  case: Case;
  opening: string[];
  reason: string;
  /** "ai": the model's words passed every check. "template": the code's words were shown. */
  source: "ai" | "template";
};

export type SafeAnswerScore = { passed: number; total: number; failures: QuestionRun[] };
export type NumberAudit = { checked: number; wrong: { id: string; numbers: string[] }[] };
export type Verdict = { safeAnswers: "PASS" | "FAIL"; wrongNumbers: "PASS" | "FAIL"; allPass: boolean };

export type EvalRun = {
  version: number;
  /** yyyy-mm-dd, the day the run happened. */
  date: string;
  model: string;
  /** The day the 20 SIPs were looked at from. Fixed, so the setback months do not move. */
  asOf: string;
  commit: string;
  /** What changed since the last version. */
  changes: string;
  questions: QuestionRun[];
  situations: SituationRun[];
  /** The lines the routes logged when they threw away an AI draft that failed a check. */
  rejectedDrafts: string[];
  safe: SafeAnswerScore;
  audit: NumberAudit;
  verdict: Verdict;
};
