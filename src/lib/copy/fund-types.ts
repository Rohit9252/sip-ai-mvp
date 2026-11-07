import type { Entry } from "./dictionary";

/**
 * Fund-type basics (version 2, from T2's request): what small cap, mid cap, large cap and hybrid mean. General terms
 * only, from AMFI's investor-education page on the types of funds and the fund categories SEBI set and AMFI
 * publishes (large cap: the 100 biggest listed companies, at least 80% in them; mid cap: ranked 101 to 250, at
 * least 65%; small cap: ranked 251 and below, at least 65%; hybrid: a mix of shares and bonds). Code writes these
 * answers, so no AI is involved and none of them picks a fund. Same three languages and style as dictionary.ts.
 * No em dashes and no semicolons.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export const FUND_TYPE_IDS = ["small", "mid", "large", "hybrid"] as const;
export type FundTypeId = (typeof FUND_TYPE_IDS)[number];

/** AMFI's page on the types of mutual funds (every link checked on 7 Nov 2026 in English and Hindi). */
export const FUND_TYPES_PATH = "what-are-various-types-mutual-funds";

type ByType = Record<FundTypeId, Entry>;

const GENERAL = {
  en: "This explains the name. It does not say which fund suits you.",
  hi: "ये बस नाम का मतलब समझाता है। ये नहीं बताता कि आपके लिए कौन सा fund ठीक है।",
  hn: "Ye bas naam ka matlab samjhata hai. Ye nahi batata ki aapke liye kaunsa fund theek hai.",
};

export const fundTypeCopy: { title: ByType; body: ByType; next: Entry; tag: Entry; readMore: Entry } = {
  title: {
    small: e("Small cap fund", "Small cap fund", "Small cap fund"),
    mid: e("Mid cap fund", "Mid cap fund", "Mid cap fund"),
    large: e("Large cap fund", "Large cap fund", "Large cap fund"),
    hybrid: e("Hybrid fund", "Hybrid fund", "Hybrid fund"),
  },
  body: {
    small: e(
      `A small cap fund mainly buys shares of smaller companies. By SEBI's rules it puts at least 65% of its money in them. AMFI counts the companies ranked 251 and below by size as small caps. ${GENERAL.en}`,
      `Small cap fund मुख्य रूप से छोटी companies के shares खरीदता है। SEBI के नियमों के हिसाब से ये अपने पैसे का कम से कम 65% इन्हीं में लगाता है। AMFI size के हिसाब से 251वें नंबर और उससे नीचे की companies को small cap गिनता है। ${GENERAL.hi}`,
      `Small cap fund mainly chhoti companies ke shares khareedta hai. SEBI ke niyam ke hisaab se ye apne paise ka kam se kam 65% inhi mein lagata hai. AMFI size ke hisaab se 251ve number aur usse neeche ki companies ko small cap ginta hai. ${GENERAL.hn}`,
    ),
    mid: e(
      `A mid cap fund mainly buys shares of medium-sized companies. By SEBI's rules it puts at least 65% of its money in them. AMFI counts the companies ranked 101 to 250 by size as mid caps. ${GENERAL.en}`,
      `Mid cap fund मुख्य रूप से मझोली companies के shares खरीदता है। SEBI के नियमों के हिसाब से ये अपने पैसे का कम से कम 65% इन्हीं में लगाता है। AMFI size के हिसाब से 101वें से 250वें नंबर तक की companies को mid cap गिनता है। ${GENERAL.hi}`,
      `Mid cap fund mainly majholi companies ke shares khareedta hai. SEBI ke niyam ke hisaab se ye apne paise ka kam se kam 65% inhi mein lagata hai. AMFI size ke hisaab se 101ve se 250ve number tak ki companies ko mid cap ginta hai. ${GENERAL.hn}`,
    ),
    large: e(
      `A large cap fund mainly buys shares of the biggest companies in India. By SEBI's rules it puts at least 80% of its money in them. AMFI counts the 100 biggest listed companies, ranked by size, as large caps. ${GENERAL.en}`,
      `Large cap fund मुख्य रूप से भारत की सबसे बड़ी companies के shares खरीदता है। SEBI के नियमों के हिसाब से ये अपने पैसे का कम से कम 80% इन्हीं में लगाता है। AMFI size के हिसाब से सबसे बड़ी 100 listed companies को large cap गिनता है। ${GENERAL.hi}`,
      `Large cap fund mainly Bharat ki sabse badi companies ke shares khareedta hai. SEBI ke niyam ke hisaab se ye apne paise ka kam se kam 80% inhi mein lagata hai. AMFI size ke hisaab se sabse badi 100 listed companies ko large cap ginta hai. ${GENERAL.hn}`,
    ),
    hybrid: e(
      `A hybrid fund buys a mix of shares (equity) and bonds (debt). How much goes to each depends on the kind of hybrid fund. For example, an aggressive hybrid fund keeps 65% to 80% in shares, and a conservative one keeps 10% to 25%. ${GENERAL.en}`,
      `Hybrid fund shares (equity) और bonds (debt) का मिला-जुला मिश्रण खरीदता है। दोनों में कितना जाता है, ये hybrid fund की किस्म पर निर्भर है। जैसे aggressive hybrid fund 65% से 80% shares में रखता है, और conservative hybrid fund 10% से 25%। ${GENERAL.hi}`,
      `Hybrid fund shares (equity) aur bonds (debt) ka mila-jula mishran khareedta hai. Dono mein kitna jaata hai, ye hybrid fund ki kism par nirbhar hai. Jaise aggressive hybrid fund 65% se 80% shares mein rakhta hai, aur conservative hybrid fund 10% se 25%. ${GENERAL.hn}`,
    ),
  },
  next: e("Next basic: {name}", "अगली बुनियादी बात: {name}", "Agli basic baat: {name}"),
  tag: e("General terms, from AMFI", "सामान्य परिभाषा, AMFI से", "Aam paribhasha, AMFI se"),
  readMore: e("Read more at AMFI", "AMFI पर और पढ़ें", "AMFI par aur padhein"),
};
