# Hand checks for the SIP maths

Four SIPs worked out by hand (a calculator, no code). Each one is also a test, so the code is held to these numbers. Checks A and B use made-up NAVs that are easy to add up. Check C uses real NAVs.

| Check | NAVs | Where the test lives |
|---|---|---|
| A | Made up | `src/lib/sip/simulate.test.ts` ("hand check A") |
| B and B2 | Made up | `src/lib/sip/simulate.test.ts` ("hand check B", "hand check B2") |
| C | Real (HDFC Flexi Cap Direct Growth and the Nifty 50 index fund) | `src/lib/sip/sample.test.ts` ("hand check C") |

## The rules the code follows

These are the exact rules. If the code and this list ever disagree, the code is wrong.

1. **Month 1** is the month of the first instalment (the start month). Month 12 is the twelfth month counting from it.
2. **Instalment.** One a month on the SIP day. If the fund has no NAV on that day (weekend, market holiday), it is bought on the next date that has one. That date can fall in the next month. An instalment after the as-of date is not counted.
3. **Units** bought = amount ÷ NAV on the instalment date. Units are not rounded (a real fund rounds to 3 decimals, which changes a value by well under a rupee). Stamp duty is ignored.
4. **Month-end snapshot.** The date is the last fund NAV date on or before the last calendar day of the month. It counts only instalments bought on or before that date.
   - **Invested** = number of instalments × amount.
   - **Value** = total units × fund NAV on the snapshot date, rounded to whole rupees.
   - **Gain** = value − invested.
5. **Finished months only.** A month gets a snapshot only if its last calendar day is on or before the as-of date, and the NAV data reaches that month. The month still running is not a snapshot (it is in `latest`).
6. **Setback.** The first month-end snapshot in months 4 to 12 where value is below invested. Equal is not below. If none, there is no setback.
7. **Market NAV on a date** = the market's NAV on that date, or the last one before it.
8. **Fund move and market move** are the percentage change in NAV (not in the person's value): (NAV at the end ÷ NAV at the start − 1) × 100. Two pairs of dates:
   - **Setback month:** from the previous month-end snapshot date to this month-end snapshot date. In month 1 (when there is no previous month-end) it starts at the first instalment date.
   - **Since the start:** from the first instalment date to this month-end snapshot date.
9. **Facts.** They describe the setback month-end. With no setback they describe the last finished month-end, and `hasSetback` is false. Each number is rounded to what the words show (money to whole rupees, percentages to one decimal), so the number and the words always agree.

## Check A (made-up NAVs): the basics

Rs 1,000 a month, SIP day 5, start January 2025, as of 31 May 2025. Fund NAV: 10 until the start of April, 8 from 7 April, 12 on 30 May.

| Instalment | Bought on | Why | NAV | Units (1,000 ÷ NAV) | Units so far |
|---|---|---|---|---|---|
| 1 | 6 Jan 2025 | 5 Jan is a Sunday | 10 | 100 | 100 |
| 2 | 5 Feb 2025 | | 10 | 100 | 200 |
| 3 | 5 Mar 2025 | | 10 | 100 | 300 |
| 4 | 7 Apr 2025 | 5 Apr is a Saturday, 6 Apr a Sunday | 8 | 125 | 425 |
| 5 | 5 May 2025 | | 8 | 125 | 550 |

| Month | Snapshot date | Invested | Units | NAV | Value | Gain |
|---|---|---|---|---|---|---|
| 1 | 31 Jan | ₹1,000 | 100 | 10 | ₹1,000 | 0 |
| 2 | 28 Feb | ₹2,000 | 200 | 10 | ₹2,000 | 0 |
| 3 | 31 Mar | ₹3,000 | 300 | 10 | ₹3,000 | 0 (equal, not a setback) |
| 4 | 30 Apr | ₹4,000 | 425 | 8 | ₹3,400 | **-₹600: the setback** |
| 5 | 30 May (31 May has no NAV) | ₹5,000 | 550 | 12 | ₹6,600 | +₹1,600 |

Moves for the setback month (31 Mar to 30 Apr 2025): fund 8 ÷ 10 − 1 = **-20.0%**. Market: it has no NAV on 30 Apr, so the 29 Apr NAV (90) is used: 90 ÷ 100 − 1 = **-10.0%**.

Moves since the start (6 Jan to 30 Apr 2025): fund 8 ÷ 10 − 1 = **-20.0%**. Market: no NAV on 6 Jan, so 3 Jan (80) is used: 90 ÷ 80 − 1 = **+12.5%**.

The test file also puts a NAV of 99 on 4 Jan and 9 on 1 May. A correct answer ignores both.

## Check B (made-up NAVs): only months 4 to 12 count

Rs 1,000 a month, day 5, start January 2025, 13 months. One NAV level per month (the same on the 5th and the 28th):

`10, 8, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 7`

| Month | NAV | Units bought | Units so far | Value | Invested | Gain |
|---|---|---|---|---|---|---|
| 2 | 8 | 125 | 225 | ₹1,800 | ₹2,000 | -₹200 (month 2 is too early) |
| 3 | 10 | 100 | 325 | ₹3,250 | ₹3,000 | +₹250 |
| 4 | 11 | 90.9091 | 415.9091 | ₹4,575 | ₹4,000 | +₹575 |
| 12 | 11 | 90.9091 | 1,143.1818 | ₹12,575 | ₹12,000 | +₹575 |
| 13 | 7 | 142.8571 | 1,286.0390 | ₹9,002 | ₹13,000 | -₹3,998 (month 13 is too late) |

Months 4 to 12 are always ₹575 above invested (325 × 11 = 3,575, and each later instalment adds exactly what it costs). So there is **no setback**.

Variant: if month 12 has a NAV of 9 instead of 11, units after month 12 = 325 + 8 × 90.9091 + 1,000 ÷ 9 = 1,163.3838. Value = 1,163.3838 × 9 = 10,470.45, shown as ₹10,470, against ₹12,000 invested. That is a setback in **month 12** (the last month that counts).

## Check B2 (made-up NAVs): the first month below invested wins

Rs 1,000 a month, day 5, start January 2025. Fund NAV by month: 10, 8, 12, 11, 9, 9. Market NAV by month: 100, 100, 100, 100, 95, 95. Instalment units: 100, 125, 83.3333, 90.9091, 111.1111, 111.1111.

| Month | Units so far | NAV | Value | Invested | Gain |
|---|---|---|---|---|---|
| 2 | 225 | 8 | ₹1,800 | ₹2,000 | -₹200 (month 2, ignored) |
| 3 | 308.3333 | 12 | ₹3,700 | ₹3,000 | +₹700 |
| 4 | 399.2424 | 11 | ₹4,392 | ₹4,000 | +₹392 |
| 5 | 510.3535 | 9 | ₹4,593 | ₹5,000 | **-₹407: the setback** |
| 6 | 621.4646 | 9 | ₹5,593 | ₹6,000 | -₹407 (below again, but not the first) |

Setback-month move (28 Apr to 28 May): fund 9 ÷ 11 − 1 = **-18.2%** (-18.1818). Market 95 ÷ 100 − 1 = **-5.0%**. Since the start (5 Jan to 28 May): fund 9 ÷ 10 − 1 = **-10.0%**, market 95 ÷ 100 − 1 = **-5.0%**.

## Check C (real NAVs): the sample SIP

HDFC Flexi Cap Fund, Direct Plan, Growth Option (scheme 118955). The market is UTI Nifty 50 Index Fund, Direct, Growth (scheme 120716). Rs 5,000 a month, day 5, start August 2025. NAVs are the real AMFI NAVs saved in `src/lib/nav/__fixtures__/`. Units are 5,000 ÷ NAV, worked to 6 decimals.

| Instalment | Day | Bought on | Why | NAV | Units | Units so far |
|---|---|---|---|---|---|---|
| 1 | 5 Aug 2025 | 5 Aug 2025 | | 2,146.403 | 2.329479 | 2.329479 |
| 2 | 5 Sep 2025 | 5 Sep 2025 | | 2,183.247 | 2.290167 | 4.619646 |
| 3 | 5 Oct 2025 | 6 Oct 2025 | 5 Oct is a Sunday | 2,228.744 | 2.243416 | 6.863062 |
| 4 | 5 Nov 2025 | 6 Nov 2025 | 5 Nov has no NAV (market holiday) | 2,245.301 | 2.226873 | 9.089935 |
| 5 | 5 Dec 2025 | 5 Dec 2025 | | 2,283.836 | 2.189299 | 11.279234 |
| 6 | 5 Jan 2026 | 5 Jan 2026 | | 2,296.880 | 2.176866 | 13.456100 |
| 7 | 5 Feb 2026 | 5 Feb 2026 | | 2,266.855 | 2.205699 | 15.661799 |
| 8 | 5 Mar 2026 | 5 Mar 2026 | | 2,210.389 | 2.262045 | 17.923844 |

| Month | Snapshot date | Invested | Units | NAV | Value | Gain |
|---|---|---|---|---|---|---|
| 1 | 29 Aug 2025 | ₹5,000 | 2.329479 | 2,155.545 | ₹5,021 | +₹21 |
| 2 | 30 Sep 2025 | ₹10,000 | 4.619646 | 2,192.760 | ₹10,130 | +₹130 |
| 3 | 31 Oct 2025 | ₹15,000 | 6.863062 | 2,266.131 | ₹15,553 | +₹553 |
| 4 | 28 Nov 2025 | ₹20,000 | 9.089935 | 2,278.251 | ₹20,709 | +₹709 |
| 5 | 31 Dec 2025 | ₹25,000 | 11.279234 | 2,272.565 | ₹25,633 | +₹633 |
| 6 | 30 Jan 2026 | ₹30,000 | 13.456100 | 2,243.711 | ₹30,192 | +₹192 |
| 7 | 27 Feb 2026 | ₹35,000 | 15.661799 | 2,261.528 | ₹35,420 | +₹420 |
| 8 | 31 Mar 2026 | ₹40,000 | 17.923844 | 1,996.490 | ₹35,785 | **-₹4,215: the setback** |

Month 8 value: 17.923844 × 1,996.49 = 35,784.78, shown as ₹35,785.

Moves for the setback month (27 Feb to 31 Mar 2026):
- Fund: 1,996.49 ÷ 2,261.528 − 1 = -0.117194 = **-11.7%**.
- Market (UTI Nifty 50 Index Fund Direct Growth): 156.116 ÷ 176.0438 − 1 = -0.113198 = **-11.3%**.

Moves since the start (5 Aug 2025 to 31 Mar 2026):
- Fund: 1,996.49 ÷ 2,146.403 − 1 = -0.069844 = **-7.0%**.
- Market: 156.116 ÷ 171.7917 − 1 = -0.091248 = **-9.1%**.

Reading it plainly: the person's fund and the whole market fell almost the same amount in March 2026 (11.7% and 11.3%). Over the whole SIP, the fund is down less than the market (7.0% and 9.1%).

## How these were cross-checked

- The numbers in A, B, B2 are small enough to add up by hand, and the tests assert the same figures.
- The numbers in C were worked out in a separate throwaway script that does not share code with `src/lib/sip`. The module was also compared with that script on 9 real funds, 21 start months, 4 SIP days and 2 as-of dates (about 1,500 SIPs), and every month-end snapshot matched. That script is not kept in the repo.
- Four deliberate breakages of the code (instalment bought on the earlier date, "below" turned into "below or equal", window widened to month 3, window widened to month 13) each made at least one test fail.
