# AI-powered MVP (Groww SIP brief)

A concept feature for a Groww-style SIP page. When a first-timer's SIP value first falls below what they put in, it asks what they think happened, then shows what actually moved their money, in English, Hindi or Hinglish, and answers follow-up questions. It explains; it never advises and never predicts.

## Language

### The investor and their SIP

**First-timer**:
A person whose first-ever mutual fund investment is this monthly SIP, made with their own money on a direct-plan app, in the first 12 months after their first instalment.
_Avoid_: New user, beginner, customer

**SIP**:
A plan that buys units of one fund with a fixed amount on a fixed day each month.
_Avoid_: Investment, plan

**Instalment**:
One monthly purchase made by a SIP.
_Avoid_: Payment, debit, kisht (in English copy)

**Invested**:
The total of all instalments paid so far.
_Avoid_: Principal, cost, money put in (in code)

**Value**:
What the units bought so far are worth at the latest NAV.
_Avoid_: Balance, current value, worth

**NAV**:
The published price of one unit of a fund on a given day.

### The moment

**Replay**:
Walking through a person's past SIP one month at a time, from its start month, on real NAVs.
_Avoid_: Simulation, animation, time travel

**Setback**:
The first month-end, in months 4 to 12 of a SIP, when its value is below what was invested.
_Avoid_: Dip, drop, loss, crash

**Market**:
The Nifty 50, used as "the whole market" when explaining a move.
_Avoid_: Benchmark, index (in user copy), sentiment

**Market move**:
How much the market rose or fell over the same dates as the person's fund. A number, never a mood or a forecast.
_Avoid_: Market sentiment, market mood

**Fund move**:
How much the person's own fund rose or fell over the same dates.

### What the helper does

**Helper card**:
The card that appears at a setback, greets the person and walks them from the guess to the reason.
_Avoid_: Chatbot, assistant, popup, Kyun

**Guess**:
The person's answer to "what do you think happened?", picked from four choices before any explanation: my fund, the whole market, don't know, or not worth it.
_Avoid_: Answer, choice, feedback

**Misread**:
A guess that does not match what actually moved the value, such as blaming the fund for a fall the whole market shared.
_Avoid_: Mistake, wrong answer

**Reason**:
The short statement of what moved this person's value, built from their own fund move and the market move.
_Avoid_: Explanation, insight, tip

**Reason line**:
The one-line reason that stays next to the value after the person has seen it.

**Follow-up**:
A question the person asks about their own SIP after seeing the reason.
_Avoid_: Chat, query, prompt

**Safe answer**:
The fixed reply shown instead of a written one when a question asks for advice or a prediction, or when a check on the written reply fails.
_Avoid_: Error message, refusal, safe fallback

### Quality

**Golden set**:
The questions and SIP situations the founder labelled by hand, used to score the helper before any release.
_Avoid_: Test data, benchmark

**Pass line**:
The score the helper must reach on the golden set, fixed before the first run.
_Avoid_: Threshold, target

### Boundaries

**Advice**:
Any statement that tells the person what to do with their money: which fund to buy, sell, switch or keep, or whether to continue or stop.
_Avoid_: Recommendation, suggestion, guidance

**Prediction**:
Any statement about what a fund, the market or the person's value will do in the future.
_Avoid_: Forecast, projection, outlook
