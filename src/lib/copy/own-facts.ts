import type { Entry } from "./dictionary";

/**
 * Version 2, fix for T1: after a question that asks for advice ("should I change my fund?") is refused, the person
 * can open their own facts in one tap. Code writes all three parts from the facts object, so no AI is involved and
 * nothing here tells anyone what to do. Same three languages and style as dictionary.ts. No em dashes, no semicolons.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export const ownFactsCopy = {
  /** Their fund against the market over the same dates, from their first instalment to now. */
  vsMarket: e(
    "Your fund against the market, {from} to {to}: your fund {fVerb} {f} and the whole market (Nifty 50) {mVerb} {m}.",
    "आपका fund और market, {from} से {to} तक: आपका fund {f} {fVerb} और पूरा market (Nifty 50) {m} {mVerb}।",
    "Aapka fund aur market, {from} se {to} tak: aapka fund {f} {fVerb} aur poora market (Nifty 50) {m} {mVerb}.",
  ),
  /** What switching involves. The exit load is about 1% of the value, the usual rule inside a year. */
  switching: e(
    "Switching means selling your units, then buying units of another fund at its price that day. Many funds charge an exit load (often 1%) on units sold within a year: about ₹{load} on your ₹{value}. Tax may apply on any gain.",
    "Fund बदलने का मतलब है अपनी units बेचना, फिर उस दिन की कीमत पर दूसरे fund की units खरीदना। कई funds एक साल के अंदर बेची गई units पर exit load (अक्सर 1%) लेते हैं: आपकी ₹{value} की value पर लगभग ₹{load}। किसी भी फ़ायदे पर tax लग सकता है।",
    "Fund badalne ka matlab hai apni units bechna, phir us din ki keemat par doosre fund ki units khareedna. Kai funds ek saal ke andar bechi gayi units par exit load (aksar 1%) lete hain: aapki ₹{value} ki value par lagbhag ₹{load}. Kisi bhi fayde par tax lag sakta hai.",
  ),
  /** What stopping does. */
  stopping: e(
    "Stopping ends the instalments still to come. The money already in your fund stays there until you withdraw it. Nothing is sold when you stop.",
    "SIP रोकने से आगे की किस्तें बंद हो जाती हैं। आपके fund में जो पैसा पहले से है, वो तब तक वहीं रहता है जब तक आप उसे निकालते नहीं। रोकने पर कुछ बेचा नहीं जाता।",
    "SIP rokne se aage ki kishtein band ho jaati hain. Aapke fund mein jo paisa pehle se hai, wo tab tak wahin rehta hai jab tak aap use nikaalte nahi. Rokne par kuch becha nahi jaata.",
  ),
};
