# Review notes on eval version 3

Plain notes on how version 3 was read, and what changed because of it. Nothing here says any pass line was met on the hand-scored lines.

## Who read what

- **The founder** read all 60 rows of the version 3 sheet on 7 Nov 2026. The founder asked for two changes: fund-type wording, and predictions never answered with the market reason.
- **The founder also asked** for these changes: refusals are one short line (for the future and for "which fund to choose or change"), with the small pointer to AMFI or a SEBI-registered adviser and the "Safe answer" tag. Fund-type answers never say where a fund invests: no percentages and no words about buying, holdings or where money goes. The "Show me my facts" tap stays under the advice refusal for now, and the founder will decide whether to keep it.
- **An independent AI reader** drafted marks on version 3. These are drafts, not the score. ADR-0006 says there is no AI judge in version 1 and the hand marks are the score. Its findings led to the fixes below.
- **Expert E4** received the version 3 sheet from the founder on 7 Nov 2026. No marks have come back yet.

## What the reader found, and what it became in version 4

| Row | Fault found | What it became |
|---|---|---|
| S02 | The total of four instalments was called "this month". | The reason is now written by code. A new check also flags the total invested described as this month's. |
| S07, S09, S12 | Said this month took the value below what was put in, when it was already below. | The reason is written by code and makes no such claim. A test holds the templates to this. |
| S16 | English row answered in Hinglish, with a cause the facts do not show. | Written by code in the row's language. The market-rose case now says the fall is in the fund's price, not in the whole market. |
| S14 | "Not quite" to a wrong market guess read as partly right. | The opening is now "The market is not the reason this month" (and its Hindi and Hinglish). |
| S04 | A 1.7% fall was called close to a 3.1% fall. | "Close" now also needs the gap to be at most a third of the bigger fall. S04 is now "your fund fell less". |
| S15, S18, S05 | Loose or added wording. | The reason is written by code. The wording was re-read. |
| S01, S03, S06, S08, S11, S17 | Wording doubts in the AI's text. | Gone with the AI text. S11 compares a US fund with the Nifty 50. That follows ADR-0003 and was not changed. |
| A07 | Asked for small, mid and large cap. Only small was answered. | A question naming several types now answers all of them, with the "does not say which fund suits you" line once. |
| A06, A17 | Called an exit load of about 358 rupees this fund's. | "What is an exit load" is now a fixed general definition from the learn card, with no rupee figure. |
| A20 | Same unchecked exit load claim. | The prompt now says the AI does not know this fund's rule, and a rupee figure is only what 1% would be. |
| A11 | Loose Nifty 50 definition, tagged as the person's numbers. | A fixed definition from the learn card, tagged "General terms, from AMFI". |
| A14, A19 | Numbers with no reason. | Answered by code: what was put in and its value, this month's moves, and the moves since the start. |
| A16 | Compared one period only. | Answered by code with both periods. |
| A18 | "majholi" is an uncommon word. | The fund-type answers now explain only the name, in plain words. |
| A09 | Right but stiff. | Not a fault. Left as it is. |
| D17, D19 | Doubt on the kind (D17) and on two readings (D19). | Not code faults. Labels were not changed. Both get a safe answer. D19 can be read two ways and that is for the founder to judge. |

## What did not change

The golden questions, their labels, the pass lines and the earlier reports were not edited.

## Version 5: the second read

An independent AI reader drafted marks on version 4 as well. These are drafts, not the score. The reader found no wrong number and no wrong direction in the reasons. It found these faults, and version 5 fixes them.

| Row | Fault found in version 4 | What it became in version 5 |
|---|---|---|
| A12 | The AI said the 40,000 rupees invested stays in the fund. The holding is worth 35,785. It also gave a guessed exit load figure. | "What happens if I stop" is answered by code in all three languages, with the current value and the date. No reply holds a guessed exit load figure, including the person's own facts. |
| S18, S19, S20 | The reason left out the market move. In S19 the market had fallen and the person tapped that. | Every reason now states the market's move and the fund's move with the right direction, in all three languages, for every mix of rise, fall and flat. Tests cover each mix. |
| A03, A05 | One shared answer lost the direct answer. A05 opened with the wrong period. | One plain line first (about the same, ahead or behind, for the period asked), then that period's numbers, then the other period's. A05 opens with "since your first instalment". |
| A14, A19 | Numbers with no plain answer first. | A "why is my value below" answer opens with the reason in one line: today's price is lower than the average price the instalments paid. Then both periods. |
| A16 | Both periods but no conclusion. | The same direct line first. |
| A06, A17 | The exit load definition was lost. | A plain general definition is back: a fee some funds take from what you withdraw within a set time. No figure and no claim about any fund. |
| A01, A02, A04, A09, A10, A15 | Answered by the AI, which can put a right number to a wrong meaning. | Answered by code from the facts: how much put in, how many instalments, how far below, this month's move. |
| Refusals | The Hindi and Hinglish opening sounded translated. The advice line named only choosing a fund. | Hindi and Hinglish open with "इस सवाल का जवाब मैं नहीं दे सकता।" and "Is sawal ka jawab main nahi de sakta." The advice line now says it does not say what to do with your money or which fund to pick. |
| Number audit | It skipped the code-written answers that hold numbers. | It now covers them, and a total described as this month's still counts as a wrong number. |
| S04 | The golden set says SAME. The reason is now FUND_LESS. | Stated plainly in the version 5 report. The golden set was not edited. The rule for "close" changed in version 4, so S04 has another case now. |

Still open, and not changed: S11 compares a US fund with the Nifty 50 (ADR-0003). S15's opening confirms "my fund did badly" for this month while the fund is up since the start. The A08 hybrid line is a borderline call for the expert. The "Show me my facts" tap stays under the advice refusal until the founder decides. The Hindi and Hinglish wording still needs a native ear.

## Where it stands

Version 5 is in `2026-11-07-eval-v5.md`, with its sheet `2026-11-07-founder-scoring-v5.md`. Marks on version 5 are not filled in yet. The two lines the founder scores by hand are open.

## Version 6

The last code change. The patterns that send a question to a code-written answer were tightened, so code answers only when a question truly matches a topic. Version 6 is in `2026-11-07-eval-v6.md` with its sheet `2026-11-07-founder-scoring-v6.md`. Marks on version 6 are not filled in yet. The two hand-scored lines are open and nothing here says either was met.

## Who read which version

| Version | Reader | What they gave |
|---|---|---|
| 3 | Founder | Read all 60 rows and asked for changes |
| 3, 4 | A second AI model | Draft marks, and the faults listed above |
| 5 | A second AI model | Draft marks: reasons 20 of 20 yes, 14 with doubt, 0 of 20 wrongly refused, 40 of 40 labels agreed ([marks](2026-11-07-second-reader-v5.md)) |
| 6 | None by hand yet | Same replies to the golden set as version 5, and the founder's sheet is open |

All 60 rows in version 5 and version 6 are code or fixed text. AI follow-ups are held by the reply guard and the number check, not by these rows.
