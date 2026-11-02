/**
 * The "Try a sample SIP" button. Real NAVs, not made up. The numbers are in docs/reference/sample-sip.md
 * and the tests in sample.test.ts check them. Month-end 31 Mar 2026 is the setback, in month 8.
 */
export const SAMPLE_SIP = {
  schemeCode: 118955,
  fundName: "HDFC Flexi Cap Fund - Direct Plan - Growth Option",
  /** Month 1 of the SIP, "yyyy-mm". */
  startMonth: "2025-08",
  /** Day of the month. */
  sipDay: 5,
  /** Whole rupees a month. */
  monthlyAmount: 5000,
} as const;
