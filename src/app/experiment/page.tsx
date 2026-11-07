import type { Metadata } from "next";
import { Card, ProofPage } from "@/components/proof/proof-page";

export const metadata: Metadata = { title: "Experiment plan · Your SIP, explained" };

/**
 * Two stages. Stage 1 runs in this MVP now: the same person reads the same fall before and after help.
 * Stage 2 is the A/B test we would run inside Groww. Results appear here only once a stage has run.
 */

// Two proportions, 5% significance (two-sided), 80% power: n per arm = (1.96 + 0.84)^2 x (p1 q1 + p2 q2) / (p1 - p2)^2.
const P1 = 0.38;
const P2 = 0.34;
const PER_ARM = Math.ceil((1.96 + 0.84) ** 2 * ((P1 * (1 - P1) + P2 * (1 - P2)) / (P1 - P2) ** 2));

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line pt-2 sm:grid-cols-[200px_1fr] sm:gap-4">
      <p className="font-semibold text-ink">{label}</p>
      <div>{children}</div>
    </div>
  );
}

export default function ExperimentPage() {
  return (
    <ProofPage
      current="/experiment"
      title="Experiment plan: prove it in two stages before it reaches every first-timer"
      lead="Stage 1 checks the one thing the helper changes directly: can a first-timer read their own fall right? Stage 2 checks whether that keeps more of them paying. Each stage has a pass line set before it runs, and a rule to stop."
    >
      <Card title="Stage 1 · Before and after, inside this MVP (built in, results pending)" tone="accent">
        <Row label="Question">With the helper, do more first-timers say correctly what moved their money in their first fall?</Row>
        <Row label="Design">
          Same person, same fall, same rule. <b>Before:</b> their first guess, before any help (four taps). <b>After:</b> the quick
          check after the reason (“this month, what moved your money most?”). Both are scored with one rule in code: blaming the fund
          when the whole market fell with it is a misread.
        </Row>
        <Row label="Who">3 first-timers in our segment first, then anyone who tries the live app. No login, no personal data.</Row>
        <Row label="Metric">Falls read right = right answers ÷ people who saw a fall, before and after.</Row>
        <Row label="Pass line">2 of 3 read it right after help, and more right after than before.</Row>
        <Row label="Stop the idea if">Under 2 of 3 read it right after help, or any reply gives advice.</Row>
        <Row label="How it is logged">One anonymous event per check (case, before, after). Never a question, an answer, a fund or an amount.</Row>
        <Row label="Results">
          <span className="font-semibold text-loss">Not run yet with in-segment users.</span> This page will show the counts once the 3
          sessions are done.
        </Row>
      </Card>

      <Card title="Stage 2 · A/B test inside Groww (designed, not run)">
        <Row label="Question">Does the helper cut how many first-timers stop after their first fall?</Row>
        <Row label="Who">5% of first-timers in our segment: first fund folio in the last 12 months, monthly SIP, direct plan, own bank account. Equity funds; Hindi and English first.</Row>
        <Row label="Arms">A: today&apos;s SIP page. B: the SIP page with the helper. Split 50/50 by person, at random.</Row>
        <Row label="Primary metric">
          Stops after a fall = stopped after a fall ÷ active at month 3. Today 38% (3 of 8 in our survey). Target 34%.
        </Row>
        <Row label="Sample size">
          About <b>{PER_ARM.toLocaleString("en-IN")} people per arm</b> to see 38% → 34% with 5% significance and 80% power: (1.96 + 0.84)² ×
          (0.38 × 0.62 + 0.34 × 0.66) ÷ 0.04². Our cautious sizing implies a lower base of about 8.6%, which would need about 16,000
          per arm, so the pilot measures the real rate first.
        </Row>
        <Row label="Timing">
          About 3,270 first-timers on Groww start each month at 5% (≈65,000 × 5%, assumed), so the arms fill within about 2 monthly
          cohorts. Each person is read 30 days after their first fall, so the first read comes about 4 to 5 months after launch.
        </Row>
        <Row label="Guardrails">
          Advice in replies: 0 (one stops the release). Effort to stop: taps ÷ today&apos;s taps stays 1.0. Amount cuts: no higher than
          arm A.
        </Row>
        <Row label="Ship if">Stops after a fall drop from 38% to 34%, the difference is significant, and every guardrail holds.</Row>
        <Row label="Then">Months 4 to 12 continuation 50% → 54%, and the North Star, 12-month continuation, 56% → 58%, read at month 12.</Row>
      </Card>
    </ProofPage>
  );
}
