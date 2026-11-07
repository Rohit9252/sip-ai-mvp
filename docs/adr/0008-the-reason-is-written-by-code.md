# The reason is written by code, the AI answers follow-ups

The first reason, the one that explains what moved the person's value, is written by code from a fixed template for the case. The AI is not called for it. The AI answers follow-up questions, in English, Hindi and Hinglish, and reads what each question asks for. This narrows ADR-0001. Numbers still come from code. Now the words of the reason come from code too.

Why: the independent reader of the version 3 eval sheet found reasons written by the AI that were wrong in ways a number check cannot see. One said a total was "this month's". Some said a month took the value below what was put in when it was already below. One answered an English row in Hinglish and added a cause the facts do not show. A template says only what the facts show, reads the same on every run, and costs no AI call. The cost is plainer wording and less warmth, which we accept.

Also in this change, after the same review:
- Questions about the future and questions asking which fund to choose get one short fixed line each, with the small pointer to AMFI and a SEBI-registered adviser. The question is not discussed.
- Fund-type answers explain only what the name means. They never say where a fund invests.
- After the second read (version 4): fair questions about stopping, how much was put in, how many instalments, how far below, and comparisons are answered by code too. Each opens with the direct answer in one plain line. No reply holds a guessed exit load figure. Every reason states both the market's move and the fund's move.
- A reply may not describe the total invested as "this month's". The number check alone could not catch this.

## Considered options

- Keep the AI reason and add more checks. Rejected: a check can only catch faults we can name in advance.
- Keep the AI reason in Hindi and Hinglish only. Rejected: the faults were in all three languages.
