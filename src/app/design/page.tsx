import type { Metadata } from "next";
import { Card, ProofPage } from "@/components/proof/proof-page";

export const metadata: Metadata = { title: "Design thesis · Your SIP, explained" };

/** Each principle, the research it comes from, and how the app carries it out. */
const PRINCIPLES = [
  {
    title: "1. Explain where they already look",
    why: "8 of 10 first-timers in our survey look mostly at the value or return figure. The fall is seen there, so the reason belongs there.",
    how: "The helper sits next to the SIP's value: a sheet on a phone, a side panel on desktop. No new screen to find.",
  },
  {
    title: "2. Ask before telling",
    why: "Asking first makes the person stop and think about the fall, and their first answer shows us how many read it right without help.",
    how: "Four taps first: my fund, the whole market, I don't know, not worth it. Then the reason. Then one quick check (ADR-0002).",
  },
  {
    title: "3. One yardstick: their fund against the whole market",
    why: "3 of 4 people who stopped asked for goal progress, a way to judge their SIP. A number alone cannot say if a fall is normal.",
    how: "Two bars for the same month: the whole market (Nifty 50) and their fund. Same dates, same scale (ADR-0003).",
  },
  {
    title: "4. Their own numbers, their own language",
    why: "94% of households prefer Hindi or a regional language (SEBI 2025). General answers in English were the help our stoppers found.",
    how: "English, Hindi and Hinglish, switchable at any time. Every reply uses only numbers from their SIP.",
  },
  {
    title: "5. The reason from code, follow-up answers from AI",
    why: "One wrong number, or one line that says more than the facts show, would break trust in a money app. A reason must read the same on every run.",
    how: "Code works out every number and writes the reason from a fixed template, in all three languages. The AI only answers follow-up questions, in the person's language, and every reply is checked and tagged “Numbers from your SIP” or “Safe answer” (ADR-0001, ADR-0008).",
  },
  {
    title: "6. Explain, never push",
    why: "The brief rules out save flows, and some people really should stop.",
    how: "No advice, no “keep going”, no reassurance. Advice questions get a fixed safe answer. The Stop button stays exactly where it was.",
  },
  {
    title: "7. Calm, not alarm",
    why: "All 4 stoppers in our survey felt “no feeling either way”: the risk is a quiet stop, not panic. Alarm colours or sounds would add worry.",
    how: "No sound for a loss. A soft chime only when help arrives, which can be turned off. The helper steps in once, at the first fall, then waits to be asked.",
  },
];

const NOT_DONE = [
  "No push notifications: the helper meets them in the app, where they already look.",
  "No streaks, badges or rewards for staying: it would turn a money decision into a game.",
  "No fund suggestions or “switch” prompts: that is advice, and it is blocked in code.",
  "No login or personal data: a replay on public prices is enough to test the idea (ADR-0004).",
];

export default function DesignPage() {
  return (
    <ProofPage
      current="/design"
      title="Design thesis: make a normal fall readable, at the moment it is seen"
      lead="First-time SIP investors stop quietly after their first fall in months 4 to 12, because the app shows the drop but never the reason. Every design choice below starts from that finding."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {PRINCIPLES.map((p, i) => (
          <Card key={p.title} title={p.title} className={i === PRINCIPLES.length - 1 && PRINCIPLES.length % 2 === 1 ? "md:col-span-2" : ""}>
            <p>
              <span className="font-semibold text-ink">Why: </span>
              {p.why}
            </p>
            <p>
              <span className="font-semibold text-ink">How: </span>
              {p.how}
            </p>
          </Card>
        ))}
      </div>
      <Card title="What we chose not to build" tone="warn">
        <ul className="list-disc pl-5">
          {NOT_DONE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>
    </ProofPage>
  );
}
