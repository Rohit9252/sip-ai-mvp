# The sample SIP ("Try a sample SIP")

Real NAVs from AMFI, read through mfapi.in on 2 Nov 2026 (the data runs to 30 Oct 2026). Nothing in it is made up. The code constant is `SAMPLE_SIP` in `src/lib/sip/sample.ts`. The test that holds it to these numbers is `src/lib/sip/sample.test.ts`.

## The SIP

| | |
|---|---|
| Fund | HDFC Flexi Cap Fund - Direct Plan - Growth Option |
| Scheme code | 118955 |
| Start month | August 2025 (15 months before 2 Nov 2026) |
| SIP day | 5 |
| Monthly amount | ₹5,000 |
| The market | UTI Nifty 50 Index Fund - Direct Plan - Growth (120716) |

## The setback

| | |
|---|---|
| Setback month | March 2026, month 8 of the SIP |
| Month-end used | 31 Mar 2026 |
| Instalments paid | 8 |
| Invested | ₹40,000 |
| Value | ₹35,785 |
| Gain | -₹4,215 (the value is 10.5% below what was invested) |
| Fund move, setback month (27 Feb to 31 Mar 2026) | -11.7% |
| Market move, setback month (27 Feb to 31 Mar 2026) | -11.3% |
| Fund move since the start (5 Aug 2025 to 31 Mar 2026) | -7.0% |
| Market move since the start (5 Aug 2025 to 31 Mar 2026) | -9.1% |

In plain words: the whole market fell about as much as the person's fund in March 2026. A person who guesses "my fund did badly" has misread it.

Value at each month-end before the setback was above what was invested every time (₹5,021, ₹10,130, ₹15,553, ₹20,709, ₹25,633, ₹30,192, ₹35,420), so month 8 is the first time the value falls below invested, in the plain sense as well as under the month 4 to 12 rule.

## Hand check

Units bought each month are ₹5,000 ÷ the NAV on the instalment date (a NAV of 2,146.403 on 5 Aug 2025 gives 2.329479 units, and so on). After eight instalments the person holds 17.923844 units. On 31 Mar 2026 the NAV is 1,996.49, so:

- Value = 17.923844 × 1,996.49 = 35,784.78, shown as ₹35,785.
- Invested = 8 × ₹5,000 = ₹40,000.
- Gain = ₹35,785 - ₹40,000 = -₹4,215.
- Fund move = 1,996.49 ÷ 2,261.528 - 1 = -11.72%, shown as -11.7%.
- Market move = 156.116 ÷ 176.0438 - 1 = -11.32%, shown as -11.3%.

The full instalment table is in `hand-checks.md` (check C). Two instalments moved off the 5th: 5 Oct 2025 was a Sunday (bought 6 Oct) and 5 Nov 2025 had no NAV (bought 6 Nov).

## How it was chosen

I scanned 9 well-known Direct Growth large-cap and flexi-cap funds, every start month from 4 to 24 months before 2 Nov 2026, SIP day 5, and kept the SIPs whose value was above invested in every earlier month and first fell below it in months 4 to 12. Many qualified. This one was picked because:
- The fall is clear: ₹4,215 below invested, and the same month the whole market fell 11.3%. That makes the helper's job (explain what moved the money) easy to see.
- It is a well-known fund (HDFC Flexi Cap), not a niche one.
- The first seven months are all above invested, so "the first time it falls below" is literally true.
- Two instalments land on a different day (a Sunday and a market holiday), which is real and tests the "next date with a NAV" rule.

Other SIPs that also qualified, for comparison:

| Fund (Direct Growth) | Start | Setback month | Invested | Value | Fund move | Market move |
|---|---|---|---|---|---|---|
| Nippon India Large Cap | May 2025 | Mar 2026 (month 11) | ₹55,000 | ₹49,338 | -11.5% | -11.3% |
| Axis Large Cap | Apr 2025 | Mar 2026 (month 12) | ₹60,000 | ₹53,911 | -11.2% | -11.3% |
| HDFC Flexi Cap | Oct 2025 | Jan 2026 (month 4) | ₹20,000 | ₹19,826 | -1.3% | -3.1% |

## Trade-offs and limits

- **The replay is long.** The card appears after 7 taps of "Next month" (the setback is in month 8). A shorter replay exists (HDFC Flexi Cap from Oct 2025 hits month 4), but its gap is only ₹174, which is a weak demo. We chose the clear case.
- **It stays valid for a while.** The setback is in the past, so new NAVs do not change it. But the set-up screen only accepts start months 4 to 24 months back, so from Aug 2027 this sample would be older than 24 months. Move the sample start month then.
- **Fixtures.** The tests use a slice of the real NAVs saved on 2 Nov 2026 (25 Jul 2025 to 10 Apr 2026), not the live network.
