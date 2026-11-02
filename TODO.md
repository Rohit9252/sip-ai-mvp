# AI-powered MVP: to-do

Part 5 of the Groww SIP brief. Live by Thu 5 Nov 2026. User tests Fri 6 and Sat 7 Nov. Submission Mon 9 Nov, 3:59 PM IST.

**What it is (one line):** on a Groww-style SIP page, when a first-timer's SIP value first falls below what they put in, a helper card asks "what do you think happened?" (four taps), then shows what actually moved their money: their fund versus the whole market, in English, Hindi or Hinglish. Then it answers follow-up questions, never with advice or predictions.

**How we work:**
- Claude Opus writes the tasks and checks the work. Sonnet 5.5 agents write the code, one phase at a time.
- After each phase, Opus verifies it: tests, build, phone and desktop screenshots, and a read of the code against this file. The founder sees the result before the next phase.
- **AI evals are the last phase** (Phase 5).

**Read before any task:** `GLOSSARY.md` (the words we use), `docs/adr/0001` to `0007` (decisions not to undo), `docs/reference/mockup-v1.html` (the approved clickable mockup; it uses the old name "Kyun?", which is dropped: never use that name).

---

## Rules for every agent

1. **Never advice, never predictions**, in any language. No fund names as suggestions, no "keep going", "stop", "will recover", "will rise". The brief forbids fear, FOMO and urgency nudges too.
2. **Numbers come from code only** (ADR-0001). The AI gets a facts object and writes words; code checks every number in its reply.
3. **No em dashes** anywhere: code comments, UI copy, docs, commit messages. Use a comma, colon, full stop or brackets.
4. **Plain words.** Short sentences. Copy a first-timer understands.
5. **No personal data.** No login, name, phone, PAN or portfolio (ADR-0004). No Groww logo. A fixed strip on every screen says it is a concept made for a course project, not made by or linked to Groww, and not investment advice.
6. **Phone first.** It must look right at 390 px wide. On a wide screen, a Desktop/Phone switch shows it as a page or in a phone frame (the attempt-one device shell).
7. **Secrets:** `OPENAI_API_KEY` lives only in `.env.local` (git-ignored) and in Vercel. Never print it, log it or commit it.
8. **Git:** work on a branch per phase (`phase-1-data`, and so on). Commit under the repo's configured author only. **No `Co-Authored-By` or any AI attribution lines.** Do not push and do not deploy unless the task says so.
9. **Tests first** for logic (the `tdd` skill). Every task ends with `npm test` and `npm run build` passing.
10. **UI tools:** the `impeccable` skill for design passes. Watermelon UI components (free, Tailwind v4: https://ui.watermelon.sh, `llms.txt` at https://ui.watermelon.sh/llms.txt) where a component fits. Mobbin only if signed in.

---

## Phase 0: setup

- [x] Repo created and first commit pushed (GitHub `Rohit9252/sip-ai-mvp`, private), 2 Nov
- [x] Grilling done; decisions written to `GLOSSARY.md` and `docs/adr/`, 2 Nov
- [x] UI tools installed at user level: Impeccable, Watermelon UI, Mobbin (Mobbin needs a paid plan and sign-in), 2 Nov
- [ ] **T0.1 Scaffold.** Next.js 16.4.2, React 19.3.0, TypeScript, Tailwind v4, App Router, `src/` folder (same versions as `../discovery-engine`). Add zod, openai, @vercel/analytics, Vitest, Playwright. Keep the existing `README.md`, `GLOSSARY.md`, `docs/`, `TODO.md`.
  Done when: `npm run build` and `npm test` pass on the empty app.
- [ ] **T0.2 Rules file.** `AGENTS.md` with the rules above plus how to run, test and build. `.env.example` with `OPENAI_API_KEY=`. `.gitignore` ignores `.env*` except `.env.example`.
- [ ] **T0.3 Key.** Copy the `OPENAI_API_KEY` line from `../discovery-engine/.env.local` into `.env.local` without printing it.

## Phase 1: data and maths (tests first)

- [ ] **T1.1 NAV client.** Fund search and NAV history from the public AMFI data at `https://api.mfapi.in/mf/search?q=` and `https://api.mfapi.in/mf/{code}`. Search shows Direct, Growth plans only. Cache on the server for 12 hours. "The market" is scheme 120716, UTI Nifty 50 Index Fund Direct Growth (ADR-0003).
- [ ] **T1.2 SIP maths.** One instalment a month on the SIP day, or the next date with a NAV. Units = amount ÷ NAV. Invested = sum of instalments. Value = units × NAV on the day. Month-end snapshots: invested, value, gain. Fund move and market move over the same dates.
- [ ] **T1.3 Setback finder.** The first month-end in months 4 to 12 when value is below invested (GLOSSARY, ADR-0005). If there is none, it says so.
- [ ] **T1.4 Facts object.** One typed object holding every number the AI may use (invested, value, gain, fund move, market move, the dates, the months kept). Formatted the Indian way (₹1,23,456).
- [ ] **T1.5 Sample SIP.** Find, from real NAVs, a direct growth equity fund and a start month (between 4 and 24 months ago) whose SIP hits a setback, for the "Try a sample SIP" button. Record the fund, the dates and a hand calculation.
  Done when: unit tests pass, including 3 SIPs whose numbers are checked by hand.

## Phase 2: screens (phone first, Groww-style, no logo)

- [ ] **T2.1 Device shell.** Port `../../attempt one/mvp/components/device-shell/device-shell.tsx` (and `overlay-layer.tsx` if needed). Wide screen: Desktop/Phone switch, phone frame. Real phone: full screen, no switch, no flash (CSS viewport query).
- [ ] **T2.2 Languages and the strip.** English by default, then हिंदी, then Hinglish, switchable on every screen. All copy in one dictionary. The concept and not-advice strip on every screen.
- [ ] **T2.3 Set-up screen.** Fund search, start month (4 to 24 months ago), monthly amount (₹100 to ₹1,00,000), SIP day (1 to 28, default 5). Or "Try a sample SIP". Wrong input is explained in plain words.
- [ ] **T2.4 SIP page.** Looks like a SIP page in Groww's app, without the logo. It shows:
  - Invested and value.
  - The change with ▲ or ▼, in green or red, plus a sign and words so it never relies on colour alone.
  - A chart of value against invested with 1M, 3M, 6M and 1Y tabs.
  - A source line under the numbers: "NAV: AMFI, via mfapi.in, as of <date>".
- [ ] **T2.5 Replay.** A "Next month" control walks the SIP month by month from its start. It stops at the setback, and the helper card appears.
- [ ] **T2.6 Helper card, template version (no AI yet).** The steps, in order:
  1. Greeting: "Hi, I'm here to help you understand what happened."
  2. The four tap guesses: my fund, the whole market, don't know, not worth it.
  3. The reason from a code template: fund move against market move, as two bars, starting from the guess. If the guess was a misread, it says so kindly.
  4. "Got it" and "Ask more".
  After "Got it", the reason line stays next to the value.
- [ ] **T2.7 Design pass.** Run `impeccable` (write `PRODUCT.md` from this file without asking questions, then critique and polish). Playwright screenshots at 390 px and 1280 px.
  Done when: the whole flow works on the sample SIP with template text, in all three languages, and matches the mockup's flow.

## Phase 3: the AI (two jobs, with guards)

- [ ] **T3.1 Reason words.** `POST /api/reason`: facts + guess + language in, 1 to 3 short sentences out (gpt-4.1-mini, zod). Checks in code:
  - Every number in the reply must be in the facts.
  - Blocked advice and prediction words, in all three languages.
  - A length cap.
  If any check fails, the person sees the Phase 2 template instead.
- [ ] **T3.2 Follow-up answers.** `POST /api/followup`. Advice and prediction questions are caught in code **before** any AI call and get the safe answer. Model this on `../discovery-engine/scripts/advice-test.mts`. The safe answer: "I can't tell you what to do with your money or what the market will do next. That would be investment advice." It also links an official investor-education page (AMFI or SEBI; check that the link opens). Other questions are answered from the facts only, with the same number and word checks on the reply.
- [ ] **T3.3 Visible quality tag.** Under every reply: "Numbers from your SIP" or "Safe answer".
- [ ] **T3.4 Limits.** A rate limit per visitor. No questions or replies stored, only anonymous counts.
  Done when: guard tests pass, a failing reply falls back to the template, and advice questions always get the safe answer.

## Phase 4: test tools and deploy

- [ ] **T4.1 Tester mode** (`/test`). It runs the Part 6 task with the same questions asked before and after:
  - "What happened to your money: your fund, the whole market, or don't know?"
  - "Would you keep going?"
  Answers are saved as anonymous events.
- [ ] **T4.2 Events** (Vercel Analytics): `setback_shown`, `guess_chosen`, `reason_shown {ai | template}`, `followup_asked {answered | safe}`, `got_it`, `tester_answer`.
- [ ] **T4.3 End-to-end tests** with Playwright at phone and desktop sizes.
- [ ] **T4.4 Deploy** to Vercel, with the key set in Vercel's environment. Check on a real phone. Founder says OK before the first deploy.

## Phase 5: AI evals (last)

- [ ] **T5.1 Golden set.**
  - 40 follow-up questions (20 to answer, 20 advice or prediction to decline), taken from engine posts and interviews, in all three languages.
  - 20 real SIP situations.
  Claude drafts the candidates; the founder labels them by hand, blind (ADR-0006).
- [ ] **T5.2 Eval runner.** `npm run eval` runs both sets and scores them against the pass lines:
  - Safe answer on 20 of 20 advice and prediction questions.
  - 0 wrong numbers.
  - The reason matches the numbers in 20 of 20 situations.
  - 2 of 20 or fewer answerable questions wrongly declined.
  It writes a dated report.
- [ ] **T5.3 Fix and re-run** until every pass line is met. Record each version's scores and what failed.
- [ ] **T5.4 "How we check the AI" page.** It shows the latest report, the sources and the checks.
- [ ] **T5.5 Evidence Log.**
  - Fill Part B with the MVP golden set and scores.
  - Part A2: the founder labels the 20 engine holdout posts by hand, then we work out the scores.
  - Move the whole log to one Google Doc (`../evidence-log/EVIDENCE-LOG.md`).

## After the build (not code)

- [ ] User tests with 3 in-segment people (Part 6): what testers hit (version 1), what we changed (version 2).
- [ ] Name for the feature (parked by the founder).
- [ ] Make the repo public at submission. Check every link in a private window.

## Timeline

| Day | Phases |
|---|---|
| Mon 2 Nov | Phase 0, Phase 1 |
| Tue 3 Nov | Phase 2 |
| Wed 4 Nov | Phase 3, Phase 4 |
| Thu 5 Nov | Phase 5 (founder labels the golden set, about 1 hour), deploy |
| Fri 6, Sat 7 Nov | User tests |
| Sun 8 Nov | Version 2 |
