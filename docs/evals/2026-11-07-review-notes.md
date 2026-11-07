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

## Where it stands

Version 4 is in `2026-11-07-eval-v4.md`, with its sheet `2026-11-07-founder-scoring-v4.md`. Marks on version 4 are not filled in yet. The two lines the founder scores by hand are open.
