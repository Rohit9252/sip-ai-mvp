import type { Entry } from "./dictionary";

/**
 * Fund-type basics (version 2, from T2's request): what small cap, mid cap, large cap, flexi cap and hybrid mean.
 * General terms only. The shares of money each type keeps come from SEBI's circular "Categorization and
 * Rationalization of Mutual Fund Schemes" of 26 February 2026, HO/24/13/15(2)2026-IMD-RAC4/I/5764/2026 (checked
 * against its text: large cap 80%, mid cap 65%, small cap 65%, flexi cap 65%, aggressive hybrid 65% to 80% in
 * shares, conservative hybrid 10% to 25%). The market-cap ranks (large: the 100 biggest listed companies, mid: ranked
 * 101 to 250, small: 251 and below) sit in SEBI's Master Circular for Mutual Funds, clause 2.7, which the circular
 * points to, so the copy calls them SEBI's market-cap ranks. The plain words follow AMFI's investor-education page on
 * the types of funds. Code writes these answers, so no AI is involved and none of them picks a fund.
 * Same three languages and style as dictionary.ts. No em dashes and no semicolons.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export const FUND_TYPE_IDS = ["small", "mid", "large", "flexi", "hybrid"] as const;
export type FundTypeId = (typeof FUND_TYPE_IDS)[number];

/** AMFI's page on the types of mutual funds (every link checked on 7 Nov 2026 in English and Hindi). */
export const FUND_TYPES_PATH = "what-are-various-types-mutual-funds";

/**
 * SEBI's legal circulars listing. The circular of 26 Feb 2026 is found on it by its title. A direct link to the
 * circular's own page could not be confirmed, so the listing page, which opens, is linked instead.
 */
export const SEBI_CIRCULARS_LINK = "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0";

type ByType = Record<FundTypeId, Entry>;

const GENERAL = {
  en: "This explains the name. It does not say which fund suits you.",
  hi: "ये बस नाम का मतलब समझाता है। ये नहीं बताता कि आपके लिए कौन सा fund ठीक है।",
  hn: "Ye bas naam ka matlab samjhata hai. Ye nahi batata ki aapke liye kaunsa fund theek hai.",
};

export const fundTypeCopy: { title: ByType; body: ByType; next: Entry; tag: Entry; readMore: Entry; sebi: Entry } = {
  title: {
    small: e("Small cap fund", "Small cap fund", "Small cap fund"),
    mid: e("Mid cap fund", "Mid cap fund", "Mid cap fund"),
    large: e("Large cap fund", "Large cap fund", "Large cap fund"),
    flexi: e("Flexi cap fund", "Flexi cap fund", "Flexi cap fund"),
    hybrid: e("Hybrid fund", "Hybrid fund", "Hybrid fund"),
  },
  body: {
    small: e(
      `A small cap fund mainly buys shares of smaller companies. By SEBI's rules it puts at least 65% of its money in them. By SEBI's market-cap ranks, companies ranked 251 and below by size are small caps. ${GENERAL.en}`,
      `Small cap fund मुख्य रूप से छोटी companies के shares खरीदता है। SEBI के नियमों के हिसाब से ये अपने पैसे का कम से कम 65% इन्हीं में लगाता है। SEBI की market-cap ranking में size के हिसाब से 251वें नंबर और उससे नीचे की companies small cap हैं। ${GENERAL.hi}`,
      `Small cap fund mainly chhoti companies ke shares khareedta hai. SEBI ke niyam ke hisaab se ye apne paise ka kam se kam 65% inhi mein lagata hai. SEBI ki market-cap ranking mein size ke hisaab se 251ve number aur usse neeche ki companies small cap hain. ${GENERAL.hn}`,
    ),
    mid: e(
      `A mid cap fund mainly buys shares of medium-sized companies. By SEBI's rules it puts at least 65% of its money in them. By SEBI's market-cap ranks, companies ranked 101 to 250 by size are mid caps. ${GENERAL.en}`,
      `Mid cap fund मुख्य रूप से मझोली companies के shares खरीदता है। SEBI के नियमों के हिसाब से ये अपने पैसे का कम से कम 65% इन्हीं में लगाता है। SEBI की market-cap ranking में size के हिसाब से 101वें से 250वें नंबर तक की companies mid cap हैं। ${GENERAL.hi}`,
      `Mid cap fund mainly majholi companies ke shares khareedta hai. SEBI ke niyam ke hisaab se ye apne paise ka kam se kam 65% inhi mein lagata hai. SEBI ki market-cap ranking mein size ke hisaab se 101ve se 250ve number tak ki companies mid cap hain. ${GENERAL.hn}`,
    ),
    large: e(
      `A large cap fund mainly buys shares of the biggest companies in India. By SEBI's rules it puts at least 80% of its money in them. By SEBI's market-cap ranks, the 100 biggest listed companies by size are large caps. ${GENERAL.en}`,
      `Large cap fund मुख्य रूप से भारत की सबसे बड़ी companies के shares खरीदता है। SEBI के नियमों के हिसाब से ये अपने पैसे का कम से कम 80% इन्हीं में लगाता है। SEBI की market-cap ranking में size के हिसाब से सबसे बड़ी 100 listed companies large cap हैं। ${GENERAL.hi}`,
      `Large cap fund mainly Bharat ki sabse badi companies ke shares khareedta hai. SEBI ke niyam ke hisaab se ye apne paise ka kam se kam 80% inhi mein lagata hai. SEBI ki market-cap ranking mein size ke hisaab se sabse badi 100 listed companies large cap hain. ${GENERAL.hn}`,
    ),
    flexi: e(
      `A flexi cap fund buys shares of companies of any size. By SEBI's rules it keeps at least 65% of its money in shares. The fund manager can move between large, mid and small companies. ${GENERAL.en}`,
      `Flexi cap fund किसी भी size की companies के shares खरीदता है। SEBI के नियमों के हिसाब से ये अपने पैसे का कम से कम 65% shares में रखता है। Fund manager large, mid और small companies के बीच बदलाव कर सकता है। ${GENERAL.hi}`,
      `Flexi cap fund kisi bhi size ki companies ke shares khareedta hai. SEBI ke niyam ke hisaab se ye apne paise ka kam se kam 65% shares mein rakhta hai. Fund manager large, mid aur small companies ke beech badlaav kar sakta hai. ${GENERAL.hn}`,
    ),
    hybrid: e(
      `A hybrid fund buys a mix of shares (equity) and bonds (debt), and sometimes other assets. How much goes to each depends on the kind of hybrid fund. For example, an aggressive hybrid fund keeps 65% to 80% in shares, and a conservative one keeps 10% to 25%. ${GENERAL.en}`,
      `Hybrid fund shares (equity) और bonds (debt) का मिला-जुला मिश्रण खरीदता है, और कभी-कभी दूसरी चीज़ें भी। दोनों में कितना जाता है, ये hybrid fund की किस्म पर निर्भर है। जैसे aggressive hybrid fund 65% से 80% shares में रखता है, और conservative hybrid fund 10% से 25%। ${GENERAL.hi}`,
      `Hybrid fund shares (equity) aur bonds (debt) ka mila-jula mishran khareedta hai, aur kabhi-kabhi doosri cheezein bhi. Dono mein kitna jaata hai, ye hybrid fund ki kism par nirbhar hai. Jaise aggressive hybrid fund 65% se 80% shares mein rakhta hai, aur conservative hybrid fund 10% se 25%. ${GENERAL.hn}`,
    ),
  },
  next: e("Next basic: {name}", "अगली बुनियादी बात: {name}", "Agli basic baat: {name}"),
  tag: e("General terms, from AMFI and SEBI", "सामान्य परिभाषा, AMFI और SEBI से", "Aam paribhasha, AMFI aur SEBI se"),
  readMore: e("Read more at AMFI", "AMFI पर और पढ़ें", "AMFI par aur padhein"),
  sebi: e(
    "SEBI circular, 26 Feb 2026 (find it by its title)",
    "SEBI का circular, 26 Feb 2026 (title से खोजें)",
    "SEBI ka circular, 26 Feb 2026 (title se khojein)",
  ),
};
