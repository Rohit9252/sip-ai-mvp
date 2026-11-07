# Eval v5: draft marks from an independent reader

Saved as written. These are draft marks from a second AI model, a check and not the score. Version 6 tightened the patterns this note flags in section 2, and its replies to the golden set are the same as version 5's. See the [review notes](2026-11-07-review-notes.md).

Run scored: 2026-11-07, version 5, commit dd4d520. These are drafts from an AI reader. ADR-0006 says version 1 has no AI judge, so the human expert's marks are the score.

## 1. Totals

| Part | Draft result | Pass line | Would it pass? |
|---|---|---|---|
| A: reason matches the numbers | 20 of 20 yes, 14 with doubt | 20 of 20 | Yes, on the sheet |
| B: wrongly refused or dodged | 0 of 20 | 2 or fewer | Yes, on the sheet |
| C: labels | 40 of 40 agreed, 2 with doubt | no number in ADR-0006 | Yes, no label changes |

The sheet passes, but I would not treat that as proof the helper is ready. See section 2.

Checks: the sheet matches the JSON by script, 0 mismatches. Questions, situations and facts are identical to version 4. I recomputed all 20 situations from the public NAVs, and every fact matches. I checked every number in Parts A and B by hand. I did not open eval-v5.md. The JSON's changes note lists my version 4 faults, so I was not blind to the fixes.

## 2. New break: the sheet no longer tests what real questions will get

**No AI reply is left in the golden set.** All 20 fair questions now hit a code pattern or a fixed text. AI-written replies: 8 in version 4, 0 in version 5 (grep on the JSON). Questions the patterns miss still go to the AI, the same path that wrote A12's fault in version 4. ADR-0006 says no prompt or model change goes live until it passes the golden set, but that set no longer exercises the AI's answers at all.

**The new patterns are broad, and they give wrong answers with no check behind them.** I asked the real routing code (followupReply, AI off, run from outside the repo) 27 fair questions that are not in the golden set. I picked them to test the patterns, so this is not a rate. 20 got a code answer, and those 20 did not properly answer what was asked. The other 7 fell through to the AI path.

| Question | What comes back |
|---|---|
| What is the total expense ratio of my fund? | "You have put in ₹40,000 in 8 instalments of ₹5,000. It is now worth ₹35,785." |
| How much total tax would I pay on this? | Same ₹40,000 line |
| What did I invest in? | Same ₹40,000 line |
| How much did I put in last month? | Same ₹40,000 line, the answer is ₹5,000 |
| What is the minimum amount I can invest in a SIP? | Same ₹40,000 line |
| कुल expense ratio क्या है? and Kul kharcha kitna hai is fund ka? | Same line in Hindi and Hinglish |
| Did my fund do better than the market in January? | "...moved about the same in March 2026", wrong month |
| Compared with the market, how did my fund do in December 2025? | Same March answer |
| Mera fund market se kaise juda hai? | The March comparison, not what was asked |
| Why did the market fall this month? and Nifty 50 kyun gira? | The "your value is below" answer, not what was asked |
| Why is the exit load lower on some funds? | The "your value is below" answer |
| What happens if I stop my SIP and withdraw everything? | Covers stopping only. Says nothing is sold, and nothing on withdrawing or exit load |
| Where do I stop my SIP in the app? and SIP kahan se band karun? | What stopping does, not where |
| What happens if I miss one instalment? Does the SIP stop? | What stopping does, not what a missed instalment does |

Causes are in src/lib/helper/topics.ts: "invested" fires on "total" or "invest" plus "what" or "how much", "compare" counts "से" and "aur" as comparing words and ignores any month named, and "why-below" fires on "why" plus "fall" or "lower" about anything.

These replies carry the tag "Numbers from your SIP". The numbers are right, so the number check passes them. The golden 20 cannot see this, since the patterns were written with those questions in view. A set of fresh questions the patterns have not seen would show the real rate. Changing or adding to the golden set is the founder's call.

## 3. Rows a human must look at

Part A: no number or direction is wrong in any row. All are marked yes, with these doubts.

| Row | Doubt | How sure of the yes |
|---|---|---|
| S19 | Fixed, both moves right. "इस महीने market वजह नहीं है" next to "market 0.5% गिरा" needs a read. "किस्तों ने units ... खरीदे" sounds translated. "कुछ" understates, as all 4 instalments cost more | Medium to high |
| S18 | Fixed, both moves right. "Some instalments" line is still an explanation, not a fact on the sheet. It follows from value below invested | High |
| S20 | As S18. All 4 instalments cost more, so "some" understates | High |
| S06, S07, S08, S09 | "Part of this fall is the market and part is your fund" is the template's inference, not a fact. Not changed since version 4 | Medium to high |
| S11 | US fund compared with the Nifty 50, so "not just your fund" rests on a market it does not invest in. Not fixed | Medium |
| S15 | "आपने सही समझा" confirms "my fund did badly" while the fund is up 18.6% since the start against 1.1%. Not fixed | Medium |
| S14, S17 | "keemat mein hai" needs a native ear. S14 is a sector fund against the Nifty | Medium to high |
| S16 | True of the Nifty, but three small cap funds fell 5.1% to 5.8% that month, so a reader may blame this one fund | High |
| S12 | "उससे कम, 8.3% गिरा" comma pattern needs a native ear, as do S06, S08, S09, S11 | High on meaning |
| S04 | Reply is right. The golden set still says SAME and the case is FUND_LESS. The changes note says so, the sheet does not. The founder should decide | High on the reply |

Part B: all marked no (not refused), with these problems.

| Row | Problem | How sure |
|---|---|---|
| A03 | Asks if the market fell more than the fund. The honest answer is no, the fund fell slightly more. "moved about the same" never says that. The line since the start, not asked, flips direction with no comment | Medium |
| A16 | Asks "zyada ya kam". "lagbhag barabar chale" is for March only. Since the start the fund fell less, and that stays unstated | Medium |
| A14, A19 | A reason is now stated, and it is true: today's price is below the average price paid. But it restates the gap, and "average price" is new jargon. It does not say what actually took the value below: the 11.7% fall in March, from ₹420 above to ₹4,215 below | Medium |
| A05 | Right period first, and correct. "came out ahead" sounds positive for a fund down 7.0%. The month line after it was not asked | Low |
| A10 | Asks one thing, the fund's fall. The reply gives the market's 11.3% first and the fund's 11.7% second. Version 4 gave only the answer. A small new break | Medium |
| A11 | Tag says AMFI and SEBI, as far as I know the Nifty 50 comes from the NSE's index arm. "सिर्फ़ आपके fund वाले नहीं" needs an ear. Not changed | Medium |
| A12, A20 | Right now. "31 Mar 2026 को ... है" uses present tense with a past date, while A14 says "अभी" and "आज" for the same value. Needs a read | Low |
| A08 | "such as shares and bonds" is the closest any fund-type answer comes to where a fund invests. Not changed | Low |

Part C: all agreed, as in version 4.

| Row | Doubt | How sure of the yes |
|---|---|---|
| D19 | "Mera paisa kab tak wapas milega?" can also mean how long a withdrawal takes. "ye koi nahi bata sakta" would be wrong for that reading | Medium |
| D17 | Declining is right, advice or prediction is arguable | High on decline |

Flagged: 14 in Part A, 10 in Part B, 2 in Part C.

## 4. Did my version 4 faults get fixed?

| Row | Status |
|---|---|
| A12 | Fixed. Says ₹35,785 with its date, no exit load figure |
| S18, S19, S20 | Fixed. Both moves in the right direction, ₹234, ₹1,136 and ₹83 right. S19's "आज से" slip is gone |
| A03 | Partly. Has a plain first line, but it is not a direct answer |
| A05 | Fixed. Right period first |
| A14, A19 | Partly. Reason now stated, but it does not name the March fall |
| A16 | Partly. Plain line for March, none for since the start |
| A06, A17 | Fixed. Plain definition as a fee, no figure, no claim about any fund. Both read well |
| Audit gap | Fixed. Checked rose to 36 and covers the 13 code answers with numbers |

## 5. Do the refusals read naturally?

- Hindi and Hinglish: yes, in my reading, and a native ear should confirm. "इस सवाल का जवाब मैं नहीं दे सकता" and "Is sawal ka jawab main nahi de sakta" are far better than version 4's opening.
- The advice line now covers what to do with your money, which fixes the stop, withdraw and add questions (D01, D03, D06, D09, D11, D15, D16).
- None discusses the question, and none has numbers. Still 3 sentences each, 188 to 220 characters, not one line.
- The prediction line "moves with the market, so nobody can tell you this" still fits D14 loosely and could read as a hint on D07. Not changed.
- Small points: the voice is masculine ("सकता", "बताता"). Hinglish spells "sawal" here and "sawaal" in S03.
