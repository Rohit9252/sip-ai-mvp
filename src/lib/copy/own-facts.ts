import type { Entry } from "./dictionary";

/**
 * Version 2, fix for T1: after a question that asks for advice ("should I change my fund?") is refused, the person
 * can open their own facts in one tap. Code writes all three parts from the facts object, so no AI is involved and
 * nothing here tells anyone what to do. Same three languages and style as dictionary.ts. No em dashes, no semicolons.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export const ownFactsCopy = {
  /** What was put in and what it is worth. The start of the answer to "why is my value below what I put in". */
  totals: e(
    "You have put in {invested} and it is now worth {value}.",
    "आपने {invested} लगाए हैं और अभी उनकी value {value} है।",
    "Aapne {invested} lagaye hain aur abhi unki value {value} hai.",
  ),
  /** Their fund against the market over the same dates, from their first instalment to now. */
  vsMarket: e(
    "Your fund against the market, {from} to {to}: your fund {fVerb} {f} and the whole market (Nifty 50) {mVerb} {m}.",
    "आपका fund और market, {from} से {to} तक: आपका fund {f} {fVerb} और पूरा market (Nifty 50) {m} {mVerb}।",
    "Aapka fund aur market, {from} se {to} tak: aapka fund {f} {fVerb} aur poora market (Nifty 50) {m} {mVerb}.",
  ),
  /** What switching involves. No rupee figure for an exit load: only the general rule, since we do not know this fund's. */
  switching: e(
    "Switching means selling your units, then buying units of another fund at its price that day. Many funds charge an exit load (often 1%) on units sold within a year, and the fund's own page has its rule. Tax may apply on any gain.",
    "Fund बदलने का मतलब है अपनी units बेचना, फिर उस दिन की कीमत पर दूसरे fund की units खरीदना। कई funds एक साल के अंदर बेची गई units पर exit load (अक्सर 1%) लेते हैं, और उसका नियम fund के अपने page पर होता है। किसी भी फ़ायदे पर tax लग सकता है।",
    "Fund badalne ka matlab hai apni units bechna, phir us din ki keemat par doosre fund ki units khareedna. Kai funds ek saal ke andar bechi gayi units par exit load (aksar 1%) lete hain, aur uska niyam fund ke apne page par hota hai. Kisi bhi fayde par tax lag sakta hai.",
  ),
  /** What stopping does. It names the current value of the units held, never the amount invested (eval version 4, A12). */
  stopping: e(
    "Stopping ends the instalments still to come. The units you already hold stay in your fund, worth {value} on {date}, until you withdraw them. Nothing is sold when you stop.",
    "SIP रोकने से आगे की किस्तें बंद हो जाती हैं। आपके पास जो units पहले से हैं, वे आपके fund में ही रहती हैं, जब तक आप उन्हें निकालते नहीं। {date} को उनकी value {value} है। रोकने पर कुछ बेचा नहीं जाता।",
    "SIP rokne se aage ki kishtein band ho jaati hain. Aapke paas jo units pehle se hain, wo aapke fund mein hi rehti hain, jab tak aap unhein nikaalte nahi. {date} ko unki value {value} hai. Rokne par kuch becha nahi jaata.",
  ),

  /** "How much have I put in and what is it worth?" */
  investedValue: e(
    "You have put in {invested} in {n} instalments of {monthly}. It is now worth {value}.",
    "आपने {n} किस्तों में {invested} लगाए हैं (हर किस्त {monthly})। अभी उनकी value {value} है।",
    "Aapne {n} kishton mein {invested} lagaye hain (har kisht {monthly}). Abhi unki value {value} hai.",
  ),
  /** "How many instalments have I paid?" */
  instalments: e(
    "You have paid {n} instalments of {monthly} each, {invested} in all.",
    "आपने {monthly} की {n} किस्तें भरी हैं, कुल {invested}।",
    "Aapne {monthly} ki {n} kishtein bhari hain, kul {invested}.",
  ),
  /** "By how much is my value below what I put in?" */
  gapBelow: e(
    "Your value is {gap} below what you put in.",
    "आपकी value लगाए हुए पैसे से {gap} कम है।",
    "Aapki value lagaye hue paise se {gap} kam hai.",
  ),
  gapAbove: e(
    "Your value is {gap} above what you put in.",
    "आपकी value लगाए हुए पैसे से {gap} ज़्यादा है।",
    "Aapki value lagaye hue paise se {gap} zyada hai.",
  ),
  gapSame: e(
    "Your value is the same as what you put in.",
    "आपकी value लगाए हुए पैसे के बराबर है।",
    "Aapki value lagaye hue paise ke barabar hai.",
  ),

  /** "Why is my value below what I put in?" The reason in one plain line. It follows from the facts: value below
   * invested means today's price is below the average price the instalments paid. */
  whyBelow: e(
    "Your {invested} is now worth {value}, which is {gap} below what you put in. That is because the fund's price today is lower than the average price your instalments paid.",
    "आपके {invested} की value अभी {value} है, जो लगाए हुए पैसे से {gap} कम है। वजह ये है कि आज fund की कीमत उस औसत कीमत से कम है जिस पर आपकी किस्तों ने units खरीदे।",
    "Aapke {invested} ki value abhi {value} hai, jo lagaye hue paise se {gap} kam hai. Wajah ye hai ki aaj fund ki keemat us ausat keemat se kam hai jis par aapki kishton ne units khareede.",
  ),
  whyNotBelow: e(
    "Your value is not below what you put in. It is {gap} above.",
    "आपकी value लगाए हुए पैसे से कम नहीं है। वो {gap} ज़्यादा है।",
    "Aapki value lagaye hue paise se kam nahi hai. Wo {gap} zyada hai.",
  ),

  /** "Did my fund do better or worse than the market?" The direct answer, in one line. */
  compareSame: e(
    "Your fund and the whole market moved about the same {period}.",
    "{period} आपका fund और पूरा market लगभग बराबर चले।",
    "{period} aapka fund aur poora market lagbhag barabar chale.",
  ),
  compareBetter: e(
    "Your fund came out ahead of the whole market {period}.",
    "{period} आपका fund पूरे market से बेहतर रहा।",
    "{period} aapka fund poore market se behtar raha.",
  ),
  compareWorse: e(
    "Your fund came out behind the whole market {period}.",
    "{period} आपका fund पूरे market से कमज़ोर रहा।",
    "{period} aapka fund poore market se kamzor raha.",
  ),
  periodMonth: e("in {month}", "{month} में", "{month} mein"),
  periodStart: e("since your first instalment", "आपकी पहली किस्त से अब तक", "aapki pehli kisht se ab tak"),
};
