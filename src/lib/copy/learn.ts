import type { Entry, Lang } from "./dictionary";

/**
 * Short explainers the helper offers after the reason, each with a link to AMFI's investor-education site
 * (mutualfundssahihai.com; every link checked on 3 Nov 2026 in English and Hindi). Facts only: no advice, no
 * predictions. Same three languages and style as dictionary.ts. No em dashes.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export type LearnCard = { id: string; title: Entry; body: Entry; path: string };

const AMFI = "https://www.mutualfundssahihai.com";

/** English readers get the English page; Hindi and Hinglish readers get the Hindi page. */
export function learnLink(path: string, lang: Lang): string {
  return `${AMFI}/${lang === "en" ? "en" : "hi"}/${path}`;
}

export const learnCopy = {
  heading: e("Learn the basics", "बुनियादी बातें समझें", "Basic baatein samjhein"),
  /** Version 2. The basics are shown one at a time: this button shows the next one. */
  another: e("Another basic ({n} of {total})", "एक और बुनियादी बात ({n}/{total})", "Ek aur basic baat ({n}/{total})"),
  readMore: e("Read more at AMFI", "AMFI पर और पढ़ें", "AMFI par aur padhein"),
  source: e(
    "Links open AMFI's investor-education site, Mutual Funds Sahi Hai.",
    "Links AMFI की investor-education site, Mutual Funds Sahi Hai, पर खुलते हैं।",
    "Links AMFI ki investor-education site, Mutual Funds Sahi Hai, par khulte hain.",
  ),
};

export const learnCards: LearnCard[] = [
  {
    id: "value",
    title: e("Why does my value change every day?", "मेरी value हर दिन क्यों बदलती है?", "Meri value har din kyun badalti hai?"),
    body: e(
      "Your fund owns shares of many companies. Their prices change every working day, so the price of one unit of your fund (the NAV) changes too. Your value is your units multiplied by today's NAV.",
      "आपका fund कई companies के shares रखता है। उनकी कीमतें हर working day बदलती हैं, इसलिए आपके fund की एक unit की कीमत (NAV) भी बदलती है। आपकी value = आपकी units × आज का NAV।",
      "Aapka fund kai companies ke shares rakhta hai. Unki keematein har working day badalti hain, isliye aapke fund ki ek unit ki keemat (NAV) bhi badalti hai. Aapki value = aapki units × aaj ka NAV.",
    ),
    path: "mutual-funds-basics",
  },
  {
    id: "nifty",
    title: e("What is the Nifty 50?", "Nifty 50 क्या है?", "Nifty 50 kya hai?"),
    body: e(
      "The Nifty 50 tracks 50 of India's largest listed companies. We use it as \"the whole market\": when it falls, most large companies' shares fell together, not only the ones in your fund.",
      "Nifty 50 भारत की 50 सबसे बड़ी listed companies को track करता है। हम इसे \"पूरा market\" मानते हैं: जब ये गिरता है, तो ज़्यादातर बड़ी companies के shares साथ में गिरते हैं, सिर्फ़ आपके fund वाले नहीं।",
      "Nifty 50 Bharat ki 50 sabse badi listed companies ko track karta hai. Hum ise \"poora market\" maante hain: jab ye girta hai, to zyadatar badi companies ke shares saath mein girte hain, sirf aapke fund wale nahi.",
    ),
    path: "what-are-index-funds",
  },
  {
    id: "below",
    title: e("What does \"below what you put in\" mean?", "\"लगाए हुए पैसे से नीचे\" का क्या मतलब है?", "\"Lagaye hue paise se neeche\" ka kya matlab hai?"),
    body: e(
      "It means your units are worth less today than the money you paid for them. No money has left your account: you still own the same units, and their value moves with prices. A gain or loss becomes final only when units are sold.",
      "इसका मतलब है कि आज आपकी units की value उस पैसे से कम है जो आपने उनके लिए दिया। आपके account से कोई पैसा नहीं गया: units वही हैं, बस उनकी value कीमतों के साथ बदलती है। फ़ायदा या नुकसान तभी तय होता है जब units बेची जाती हैं।",
      "Iska matlab hai ki aaj aapki units ki value us paise se kam hai jo aapne unke liye diya. Aapke account se koi paisa nahi gaya: units wahi hain, bas unki value keematon ke saath badalti hai. Fayda ya nuksaan tabhi tay hota hai jab units bechi jaati hain.",
    ),
    path: "how-do-i-get-my-returns-mutual-funds",
  },
  {
    id: "units",
    title: e("How does a SIP buy units?", "SIP units कैसे खरीदती है?", "SIP units kaise khareedti hai?"),
    body: e(
      "Each month the same amount buys units at that day's NAV: more units when the NAV is lower, fewer when it is higher. Your units add up month by month.",
      "हर महीने वही रकम उस दिन के NAV पर units खरीदती है: NAV कम हो तो ज़्यादा units, ज़्यादा हो तो कम units। आपकी units महीने-दर-महीने जुड़ती जाती हैं।",
      "Har mahine wahi rakam us din ke NAV par units khareedti hai: NAV kam ho to zyada units, zyada ho to kam units. Aapki units mahine-dar-mahine judti jaati hain.",
    ),
    path: "sip-and-how-it-works",
  },
];

/** For the withdraw screen: what costs come with selling units. */
export const exitLoadLearn: LearnCard = {
  id: "exit",
  title: e("What costs come with withdrawing?", "पैसे निकालने पर क्या खर्च लगते हैं?", "Paise nikaalne par kya kharch lagte hain?"),
  body: e(
    "Many funds charge an exit load if units are sold within a set time, often a year. Tax may apply on any gain.",
    "कई funds तय समय (अक्सर एक साल) के अंदर units बेचने पर exit load लेते हैं। किसी भी फ़ायदे पर tax लग सकता है।",
    "Kai funds tay samay (aksar ek saal) ke andar units bechne par exit load lete hain. Kisi bhi fayde par tax lag sakta hai.",
  ),
  path: "what-costs-does-one-incur-while-redeeming-mutual-fund-units",
};
