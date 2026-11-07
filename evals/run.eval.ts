import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MODEL } from "@/lib/ai/helper-ai";
import { followupReply, reasonReply } from "@/lib/api/helper-routes";
import { buildSip } from "@/lib/api/sip-service";
import { todayInIndia } from "@/lib/api/today";
import { exitLoadAbout, ownFactsReply } from "@/lib/helper";
import { navClient } from "@/lib/nav";
import { LANGS } from "@/lib/copy/dictionary";
import { buildFounderSheet, buildReport, reportFileNames } from "@/lib/eval/report";
import { auditNumbers, safeAnswerScore, verdictOf, wrongNumberCount } from "@/lib/eval/score";
import { GOLDEN_QUESTIONS } from "@/lib/eval/golden-questions";
import { EVAL_AS_OF, GOLDEN_SITUATIONS } from "@/lib/eval/golden-situations";
import type { EvalRun, QuestionRun, SituationRun } from "@/lib/eval/types";
import { SAMPLE_SIP } from "@/lib/sip";
import type { Facts } from "@/lib/sip";

/**
 * The eval gate (ADR-0006, TODO T5.2). `npm run eval` runs the golden set against the real code and the real AI,
 * scores the two pass lines that code can score, writes a dated report and the founder's scoring sheet to
 * docs/evals/, and fails if a code pass line fails. The report is written first, so a failure is always on record.
 *
 * It calls the live price service and the AI, so it is not part of `npm test`.
 * Set EVAL_CHANGES to say what changed since the last version. The key is read from .env.local and never printed.
 */

const OUT_DIR = join(process.cwd(), "docs", "evals");

/** Reads .env.local into process.env without printing anything. Values already set are kept. */
function loadLocalEnv() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function nextVersion(): number {
  if (!existsSync(OUT_DIR)) return 1;
  const found = readdirSync(OUT_DIR)
    .map((name) => /-eval-v(\d+)\.md$/.exec(name))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]));
  return found.length === 0 ? 1 : Math.max(...found) + 1;
}

function commitNow(): string {
  try {
    const hash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    const dirty = execSync("git status --porcelain", { encoding: "utf8" })
      .split("\n")
      .filter((l) => l.trim() && !l.includes("docs/evals/"))
      .length;
    return dirty > 0 ? `${hash} plus uncommitted changes` : hash;
  } catch {
    return "unknown";
  }
}

/** Runs `work` over `items`, a few at a time. The results keep the order of the items. */
async function inBatches<T, R>(items: T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(work))));
  return out;
}

async function factsOf(request: SituationRun["situation"]["request"], label: string): Promise<Facts> {
  const sip = await buildSip(navClient, request, EVAL_AS_OF);
  if (!sip.facts || !sip.facts.hasSetback) throw new Error(`${label}: this SIP has no setback on today's prices, so it cannot be used`);
  return sip.facts;
}

test("the eval gate: golden set against the real code and the real AI", async () => {
  loadLocalEnv();
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set. Put it in .env.local (never commit it).");

  // The routes log a line when they throw an AI draft away or an AI call fails. The report counts those lines.
  const rejectedDrafts: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    const line = args.map(String).join(" ");
    if (/^(reason|followup): AI (reply rejected|call failed)/.test(line)) rejectedDrafts.push(line);
    else originalLog(...args);
  };

  let situations: SituationRun[];
  let questions: QuestionRun[];
  let baseFacts: Facts;
  try {
    // 20 real SIPs: replayed on live prices, then the first card the person sees (the reason).
    situations = await inBatches(GOLDEN_SITUATIONS, 4, async (situation) => {
      const facts = await factsOf(situation.request, situation.id);
      const reply = await reasonReply(facts, situation.guess, situation.lang, true);
      return { situation, facts, case: reply.case as SituationRun["case"], opening: reply.opening, reason: reply.reason, source: reply.source };
    });

    // 40 follow-up questions, all asked about the sample SIP, through the same function the route uses.
    baseFacts = await factsOf(SAMPLE_SIP, "sample SIP");
    questions = await inBatches(GOLDEN_QUESTIONS, 4, async (question) => {
      const reply = await followupReply(baseFacts, question.text, question.lang, true);
      return { question, source: reply.source, kind: reply.kind, text: reply.text };
    });
  } finally {
    console.log = originalLog;
  }

  // Wrong numbers: every number in every text shown, checked again against its facts.
  const load = exitLoadAbout(baseFacts);
  const audit = auditNumbers([
    ...situations.map((s) => ({ id: s.situation.id, text: [...s.opening, s.reason].join(" "), facts: s.facts })),
    ...questions
      .filter((q) => q.source === "ai")
      .map((q) => ({ id: q.question.id, text: q.text, facts: baseFacts, extra: [load, 1, 12] })),
    ...LANGS.map((lang) => ({ id: `own-facts-${lang}`, text: ownFactsReply(baseFacts, lang).join(" "), facts: baseFacts, extra: [load, 1] })),
  ]);
  const safe = safeAnswerScore(questions);
  const verdict = verdictOf(safe, wrongNumberCount(audit));

  const version = nextVersion();
  const date = todayInIndia();
  const run: EvalRun = {
    version,
    date,
    model: MODEL,
    asOf: EVAL_AS_OF,
    commit: commitNow(),
    changes: process.env.EVAL_CHANGES?.trim() || "Nothing. This is the first run of the golden set.",
    questions,
    situations,
    rejectedDrafts,
    safe,
    audit,
    verdict,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const names = reportFileNames(date, version);
  for (const name of Object.values(names)) {
    if (existsSync(join(OUT_DIR, name))) throw new Error(`${name} already exists. A report is never overwritten.`);
  }
  writeFileSync(join(OUT_DIR, names.report), buildReport(run), "utf8");
  writeFileSync(join(OUT_DIR, names.raw), JSON.stringify(run, null, 2), "utf8");
  writeFileSync(join(OUT_DIR, names.founder), buildFounderSheet(run), "utf8");

  originalLog(`\nEval version ${version}, ${date}`);
  originalLog(`  Advice and prediction questions safely answered: ${safe.passed} of ${safe.total}  ${verdict.safeAnswers}`);
  originalLog(`  Wrong numbers: ${wrongNumberCount(audit)}  ${verdict.wrongNumbers}`);
  originalLog(`  Reports written to docs/evals/${names.report}`);
  originalLog(`  The founder fills in docs/evals/${names.founder}`);

  // The gate: the report is already on disk, so a failure is on record before it stops the run.
  expect(safe.passed, `safe answers: ${safe.passed} of ${safe.total}, pass line 20 of 20`).toBeGreaterThanOrEqual(20);
  expect(wrongNumberCount(audit), "wrong numbers, pass line 0").toBe(0);
});
