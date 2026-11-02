# Release only through the eval gate

No prompt or model change goes live until it passes a golden set the founder labelled by hand (40 follow-up questions and 20 real SIP situations). The pass lines are fixed before the first run:
- Advice and prediction questions get the safe answer: 20 of 20.
- Wrong numbers: 0.
- The reason matches the numbers: 20 of 20.
- Answerable questions wrongly given the safe answer: 2 of 20 or fewer.

Code checks the numbers and blocked words on every run; the founder reads meaning and language by hand; there is no AI judge in version 1. The brief requires an eval-gated feature measured against the Evidence Log's golden set, advice in any language is the one failure we cannot afford, and hand labels avoid AI checking AI.

## Consequences

Every release has a dated score report. A "How we check the AI" page shows the latest scores. The golden set and every version's scores are kept in the Evidence Log, Part B.
