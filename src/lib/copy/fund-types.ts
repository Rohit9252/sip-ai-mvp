import type { Entry } from "./dictionary";

/**
 * Fund-type basics (version 2, from T2's request): what small cap, mid cap, large cap, flexi cap and hybrid mean.
 * Each answer explains only what the NAME means. It never says where a fund invests: no percentages and no words
 * about buying, holdings or where money goes (founder decision after the eval version 3 review), so none of it can
 * read as a pointer to a fund. The market-cap ranks (large: the 100 biggest listed companies, mid: ranked 101 to
 * 250, small: 251 and below) sit in SEBI's Master Circular for Mutual Funds, clause 2.7, which SEBI's circular
 * "Categorization and Rationalization of Mutual Fund Schemes" of 26 February 2026 points to
 * (HO/24/13/15(2)2026-IMD-RAC4/I/5764/2026), so the copy calls them SEBI's market-cap ranks. The plain words follow
 * AMFI's investor-education page on the types of funds. Code writes these answers, so no AI is involved.
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

/** Said once at the end of every answer, however many types it covers. */
export const fundTypeGeneral: Entry = e(
  "This explains the name. It does not say which fund suits you.",
  "ये बस नाम का मतलब समझाता है। ये नहीं बताता कि आपके लिए कौन सा fund ठीक है।",
  "Ye bas naam ka matlab samjhata hai. Ye nahi batata ki aapke liye kaunsa fund theek hai.",
);

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
      "The name small cap means companies ranked 251 and below by size, by SEBI's market-cap ranks.",
      "Small cap नाम का मतलब है SEBI की market-cap ranking में size के हिसाब से 251वें नंबर और उससे नीचे की companies।",
      "Small cap naam ka matlab hai SEBI ki market-cap ranking mein size ke hisaab se 251ve number aur usse neeche ki companies.",
    ),
    mid: e(
      "The name mid cap means companies ranked 101 to 250 by size, by SEBI's market-cap ranks.",
      "Mid cap नाम का मतलब है SEBI की market-cap ranking में size के हिसाब से 101वें से 250वें नंबर तक की companies।",
      "Mid cap naam ka matlab hai SEBI ki market-cap ranking mein size ke hisaab se 101ve se 250ve number tak ki companies.",
    ),
    large: e(
      "The name large cap means the 100 biggest listed companies by size, by SEBI's market-cap ranks.",
      "Large cap नाम का मतलब है SEBI की market-cap ranking में size के हिसाब से सबसे बड़ी 100 listed companies।",
      "Large cap naam ka matlab hai SEBI ki market-cap ranking mein size ke hisaab se sabse badi 100 listed companies.",
    ),
    flexi: e(
      "The name flexi cap means the fund is not tied to one company size.",
      "Flexi cap नाम का मतलब है कि fund किसी एक company size से बँधा नहीं है।",
      "Flexi cap naam ka matlab hai ki fund kisi ek company size se bandha nahi hai.",
    ),
    hybrid: e(
      "The name hybrid means a mix of different kinds of assets, such as shares and bonds.",
      "Hybrid नाम का मतलब है अलग-अलग तरह की assets का मिश्रण, जैसे shares और bonds।",
      "Hybrid naam ka matlab hai alag-alag tarah ki assets ka mishran, jaise shares aur bonds.",
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
