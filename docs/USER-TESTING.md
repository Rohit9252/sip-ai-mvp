# User testing

Who tried the MVP, where they got stuck, and what we change because of it. People are shown by label only (E for expert, T for tester). No names, phone numbers or emails are kept here.

## How we ran it

- **When:** 3 and 4 November 2026.
- **How:** founder-led sessions on the live app ([sip-ai-mvp.vercel.app](https://sip-ai-mvp.vercel.app/)), with the sample SIP. We noted what worked, where they got stuck and what they asked for. T2 saw the MVP right after their research interview.
- **What we looked for:** do they understand why their money fell, where do they get stuck, and does anything feel like advice.

## Who tried it

| Person | In our segment? | What worked | Where they got stuck | What we change (version 2) |
|---|---|---|---|---|
| **E3**, expert who works in finance | No (expert review) | Called it "a very good thing"; the three languages are "quite good" | The basics are shown as a list of folded cards: too much at once | One basic at a time, inside the answer |
| **T1**, tester | Not confirmed yet | Liked the solution | Asked "should I change my fund? what should I do now?" and got only the safe answer. Nothing else was offered: a dead end | Refuse the advice, then offer their own facts in one tap: their fund against the market over their SIP months, what switching involves, and what stopping does |
| **T2**, first-time investor (also interview I7) | **Yes** | "Beginner-friendly"; liked the learning part; "no platform does this" | Wants small cap, mid cap, large cap and hybrid funds explained | Fund-type basics in general terms, from AMFI, with no advice |

## What we learned

1. **The safety lock works, but a bare refusal is a dead end.** T1's question was caught before any AI call, as designed. But behind "should I switch?" is "is my fund bad?", and that second question we *can* answer from their own numbers. The fix keeps the refusal and adds the facts. We also replace the suggested question "Should I switch to another fund?" with "Did my fund do worse than the market?", so we stop leading people into the refusal.
2. **Language is a strength.** E3 and T2 both called out the three languages and the learning part.
3. **People want the basics, one at a time.** E3 found the list too much; T2 asked for fund types. Both point to short basics inside the answer, not a separate list.

## What we said we would run, and what actually ran

| Planned | What actually ran |
|---|---|
| 3 testers from our segment | 3 people tried it; **1 of 3 is confirmed in our segment** (T2) |
| Before-and-after task: "why did your money fall?", first without the helper, then with it, scored by one rule in code | **Built into the MVP, not run yet** with any tester ([experiment plan](https://sip-ai-mvp.vercel.app/experiment)) |
| Version 2 fixes for what testers hit | Planned, not live yet |
| New questions from testers in the eval gate | T1's question and T2's fund-type questions, in English, Hindi and Hinglish, go into the eval gate's question set ([ADR-0006](adr/0006-release-only-through-the-eval-gate.md)) |

## What this testing cannot tell you

- 3 people is a small test, and they came through the founder's own network.
- They used a sample SIP on public prices, not their own money, so it shows understanding, not whether they would keep paying.
- Whether the helper changes who stops needs the A/B test inside Groww described in the [experiment plan](https://sip-ai-mvp.vercel.app/experiment).
