# Product

<!-- impeccable:product-schema 1 -->

Written from `TODO.md`, `GLOSSARY.md`, `docs/adr/0001` to `0007`, `docs/reference/copy.md` and the Phase 2 brief. Nobody was interviewed: every fact below comes from those files or from the founder's brief for this phase. Nothing here is a guess about visual style.

## Platform

web

## Users

First-time investors in India. The glossary calls them a first-timer: this monthly SIP is their first-ever mutual fund investment, bought with their own money on a direct-plan app, in the first 12 months after the first instalment.

- They use a phone, usually a mid-range Android on mobile data. Most open it one-handed.
- Many read Hindi or Hinglish (Hindi written in Roman letters) more easily than English. English is the default on screen; Hindi and Hinglish are one tap away on every screen.
- The moment: they open the SIP page, see that the value is below what they put in, and do not know why. They may blame their own fund when the whole market fell.
- The job: understand what moved their money, in their own words, without being told what to do.

## Product Purpose

A concept feature for a Groww-style SIP page (Part 5 of the Groww SIP brief). When a first-timer's SIP value first falls below what they put in (the setback), a helper card asks "what do you think happened?" (four taps), then shows what actually moved their money: their fund against the whole market (Nifty 50). It then answers follow-up questions about their own SIP. It explains. It never advises and never predicts.

Success is the input metric "falls read correctly": the share of people whose guess matches what actually moved the value, before and after the card. Usage ("card opened") is not success.

## Positioning

Today's SIP pages show a red number and no reason. This asks first, then shows the reason from the person's own fund and the real market move, in their language. A neighbouring product could copy the screen in a week. The part that is hard to copy is the discipline: numbers come only from code, replies are checked against a golden set the founder labelled by hand, and advice questions always get a fixed safe answer.

## Operating Context

- The app replays the person's SIP month by month on real NAVs (AMFI, via mfapi.in), because on test day their real SIP is probably not in a setback (ADR-0005). A "Next month" control walks the replay; a small "Skip to the setback" shortcut saves testers time.
- A fixed strip on every screen says the page is a concept made for a graduation project, not made by or linked to Groww, and not investment advice.
- Shown to mentors and testers on a wide screen (in a phone frame, or as a page) and on real phones.
- Tested with 3 in-segment people on Fri 6 and Sat 7 Nov 2026. Submission Mon 9 Nov, 3:59 PM IST.

## Capabilities and Constraints

- Phase 2 (this one) uses fixed templates for every word. No AI calls yet. The reason is built in code from the facts object (ADR-0001).
- Never advice, never predictions, in any language. No fear, no urgency, no "don't worry" or "keep going".
- No login, name, phone, PAN or portfolio (ADR-0004). No Groww logo.
- Phone first: it must look right at 390 px wide.
- Every number is worked out in code. Money is shown the Indian way (₹1,23,456), percentages to one decimal.
- The Stop SIP button never moves or hides. In the concept it changes nothing and says so.
- Words to use: invested, value, setback, fund move, market move, instalment, replay, reason, reason line. Words to avoid in copy: dip, crash, principal, balance, benchmark, index. Never the name "Kyun?".
- All copy lives in one typed dictionary in English, Hindi and Hinglish (`docs/reference/copy.md` is the source).

## Brand Commitments

- Groww-style look and feel (a white, calm, roomy mutual fund holding screen) with no logo and no Groww trademark. This is binding from ADR-0004.
- Voice: calm, plain, never pushy. Short sentences, everyday words, no jargon.
- No em dashes anywhere, including UI copy.

## Evidence on Hand

- The approved clickable mockup: `docs/reference/mockup-v1.html` (flow and feel only; its old name, free-text box, yardstick and goal line are dropped).
- The sample SIP on real NAVs: `docs/reference/sample-sip.md` (HDFC Flexi Cap Direct Growth, Aug 2025, Rs 5,000, setback in month 8, March 2026: fund -11.7%, market -11.3%).
- Hand-checked maths: `docs/reference/hand-checks.md`.
- The full copy deck: `docs/reference/copy.md`.
- No real user photos, testimonials or logos exist. Do not invent any.

## Product Principles

- Ask before you tell: one question per setback, answered by a tap.
- Numbers from code, words from templates (and later, checked AI).
- Only what happened, never what will happen or what to do.
- The way out stays where it was: Stop SIP never moves.
- Readable first: Hindi, Hinglish and English are equal, and colour is never the only signal.

## Accessibility & Inclusion

- Gain and loss never rely on colour alone: arrow (▲ or ▼), a + or - sign, the rupee amount and words.
- Green and red chosen to pass contrast on white and to stay apart for people with red-green colour blindness.
- Devanagari must render cleanly: a font that covers Hindi, and line height that does not clip the vowel marks.
- Touch targets of at least 44 px. Visible keyboard focus. Respect reduced-motion.
