/**
 * Every word on screen, in three languages, in one place. The source is docs/reference/copy.md.
 * Numbers are never typed here: they are `{braces}` filled by code (ADR-0001).
 * Entries marked NEW were missing from the copy deck and were added in the same plain style.
 * No em dashes. Never advice, never predictions.
 */

export const LANGS = ["en", "hi", "hn"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

/** One string in each language: English, Hindi (Devanagari), Hinglish (Hindi in Roman letters). */
export type Entry = Readonly<Record<Lang, string>>;

const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

/** The page language attribute for each language. Hinglish is Hindi in Latin letters. */
export const HTML_LANG: Record<Lang, string> = { en: "en", hi: "hi", hn: "hi-Latn" };

export const copy = {
  /** 1. On every screen. */
  common: {
    strip: e(
      "Concept for a Groww feature, made for a graduation project. Not made by or linked to Groww.",
      "Groww के एक feature का concept, एक graduation project के लिए बनाया गया। Groww ने नहीं बनाया, Groww से जुड़ा नहीं।",
      "Groww ke ek feature ka concept, ek graduation project ke liye banaya gaya. Groww ne nahi banaya, Groww se juda nahi.",
    ),
    /** NEW. Shown in bold right after the strip, so it is never missed. */
    stripAdvice: e("Not investment advice.", "ये निवेश सलाह नहीं है।", "Ye investment advice nahi hai."),
    langName: { en: "English", hi: "हिंदी", hn: "Hinglish" } satisfies Entry,
    source: e("NAV: AMFI, via mfapi.in, as of {date}", "NAV: AMFI (mfapi.in), {date} तक", "NAV: AMFI (mfapi.in), {date} tak"),
    tagNumbers: e("Numbers from your SIP", "आपकी SIP के numbers", "Aapki SIP ke numbers"),
    tagSafe: e("Safe answer", "Safe जवाब", "Safe jawab"),
    notice: e(
      "This only explains what happened to your money. It is not investment advice.",
      "ये सिर्फ़ बताता है कि आपके पैसे के साथ क्या हुआ। ये निवेश सलाह नहीं है।",
      "Ye sirf batata hai ki aapke paise ke saath kya hua. Ye investment advice nahi hai.",
    ),
    loadError: e(
      "We couldn't load fund prices right now. Please try again in a minute.",
      "अभी fund की कीमतें नहीं आ पाईं। एक मिनट बाद फिर कोशिश करें।",
      "Abhi fund ki keemat nahi aa paayi. Ek minute baad phir try karein.",
    ),
    /** NEW. */
    retry: e("Try again", "फिर कोशिश करें", "Phir try karein"),
    /** NEW. */
    loading: e("Getting your SIP...", "आपकी SIP आ रही है...", "Aapki SIP aa rahi hai..."),
    /** NEW. The label of the language switch, for screen readers. */
    langLabel: e("Language", "भाषा", "Bhasha"),
    /** NEW. The sound switch in the top bar, for screen readers and its tooltip. */
    soundOff: e("Turn sounds off", "आवाज़ बंद करें", "Awaaz band karein"),
    soundOn: e("Turn sounds on", "आवाज़ चालू करें", "Awaaz chalu karein"),
  },

  /** 2. Set-up screen. */
  setup: {
    title: e("Your SIP", "आपकी SIP", "Aapki SIP"),
    sub: e(
      "Enter your SIP to see your first year, month by month. We don't ask for your name, phone or PAN.",
      "अपनी SIP भरें और अपना पहला साल महीने-दर-महीने देखें। हम आपका नाम, phone या PAN नहीं माँगते।",
      "Apni SIP bharein aur apna pehla saal mahine-dar-mahine dekhein. Hum aapka naam, phone ya PAN nahi maangte.",
    ),
    fund: e("Fund", "Fund", "Fund"),
    fundHint: e("Search your fund (Direct, Growth)", "अपना fund खोजें (Direct, Growth)", "Apna fund search karein (Direct, Growth)"),
    start: e("When did your SIP start?", "आपकी SIP कब शुरू हुई?", "Aapki SIP kab shuru hui?"),
    amount: e("Monthly amount", "हर महीने की रकम", "Har mahine ki rakam"),
    amountHint: e("₹100 to ₹1,00,000", "₹100 से ₹1,00,000", "₹100 se ₹1,00,000"),
    day: e("SIP date each month", "हर महीने SIP की तारीख़", "Har mahine SIP ki date"),
    show: e("Show my SIP", "मेरी SIP दिखाएँ", "Meri SIP dikhao"),
    sample: e("Try a sample SIP", "Sample SIP देखें", "Sample SIP dekho"),
    errFund: e("Pick a fund from the list.", "List में से एक fund चुनें।", "List mein se ek fund chuniye."),
    errStart: e(
      "Pick a month between {min} and {max}.",
      "{min} और {max} के बीच का महीना चुनें।",
      "{min} aur {max} ke beech ka mahina chuniye.",
    ),
    errAmount: e(
      "Enter an amount between ₹100 and ₹1,00,000.",
      "₹100 से ₹1,00,000 के बीच की रकम भरें।",
      "₹100 se ₹1,00,000 ke beech ki rakam bhariye.",
    ),
    errDay: e("Pick a date between 1 and 28.", "1 से 28 के बीच की तारीख़ चुनें।", "1 se 28 ke beech ki date chuniye."),
    /** NEW. The empty choice in the month list. */
    startHint: e("Choose a month", "महीना चुनें", "Mahina chuniye"),
    /** NEW. */
    searching: e("Searching...", "खोज रहे हैं...", "Search ho raha hai..."),
    /** NEW. */
    noFunds: e(
      "No Direct, Growth fund matches. Try another name.",
      "कोई Direct, Growth fund नहीं मिला। दूसरा नाम आज़माएँ।",
      "Koi Direct, Growth fund nahi mila. Doosra naam try karein.",
    ),
    /** NEW. Button that clears the chosen fund. */
    changeFund: e("Change", "बदलें", "Badlein"),
    /** NEW. Between the sample button and the form. */
    orYours: e("or enter yours", "या अपनी भरें", "ya apni bharein"),
    /** NEW. */
    dayHint: e("1 to 28", "1 से 28", "1 se 28"),
    /** NEW. The fund did not exist yet at the chosen start month. */
    tooNew: e(
      "This fund has no prices for that start month. Pick a later month or another fund.",
      "इस fund की उस महीने की कीमतें नहीं हैं। बाद का महीना या दूसरा fund चुनें।",
      "Is fund ki us mahine ki keematein nahi hain. Baad ka mahina ya doosra fund chuniye.",
    ),
  },

  /** 3. SIP page. */
  sip: {
    invested: e("Invested", "लगाया", "Lagaya"),
    value: e("Current value", "अभी की value", "Abhi ki value"),
    returns: e("Total returns", "कुल returns", "Total returns"),
    monthBadge: e(
      "Month {n} of your SIP · {month}",
      "आपकी SIP का महीना {n} · {month}",
      "Aapki SIP ka mahina {n} · {month}",
    ),
    instalments: e(
      "{n} instalments · ₹{amount} a month",
      "{n} किस्तें · हर महीने ₹{amount}",
      "{n} kishtein · har mahine ₹{amount}",
    ),
    /** NEW. The same line for exactly one instalment. */
    instalment1: e(
      "1 instalment · ₹{amount} a month",
      "1 किस्त · हर महीने ₹{amount}",
      "1 kisht · har mahine ₹{amount}",
    ),
    legendValue: e("Returns", "Returns", "Returns"),
    legendInvested: e("What you put in", "लगाया हुआ पैसा", "Lagaya hua paisa"),
    stop: e("Stop SIP", "SIP रोकें", "SIP roko"),
    stopNote: e(
      "In the real app this stops future instalments. This concept doesn't change anything.",
      "असली app में इससे आगे की किस्तें रुक जाती हैं। ये concept कुछ नहीं बदलता।",
      "Asli app mein isse aage ki kishtein ruk jaati hain. Ye concept kuch nahi badalta.",
    ),
    /** NEW. For screen readers. */
    chartLabel: e(
      "Chart of your value and what you invested",
      "आपकी value और लगाए हुए पैसे का chart",
      "Aapki value aur lagaye hue paise ka chart",
    ),
    /** NEW. Words next to the returns, so the colour is never the only signal. */
    above: e("Above what you put in", "लगाए हुए पैसे से ऊपर", "Lagaye hue paise se upar"),
    /** NEW. */
    below: e("Below what you put in", "लगाए हुए पैसे से नीचे", "Lagaye hue paise se neeche"),
    /** NEW. */
    equal: e("Same as what you put in", "लगाए हुए पैसे के बराबर", "Lagaye hue paise ke barabar"),
  },

  /** 4. Replay. */
  replay: {
    next: e("Next month", "अगला महीना", "Agla mahina"),
    restart: e("Back to start", "शुरू से", "Shuru se"),
    noSetback: e(
      "No setback in your first year: at every month-end from month 4 to 12, your value stayed above what you put in.",
      "पहले साल में कोई setback नहीं: महीना 4 से 12 तक हर महीने के आख़िर में आपकी value लगाए हुए पैसे से ऊपर रही।",
      "Pehle saal mein koi setback nahi: mahina 4 se 12 tak har mahine ke aakhir mein aapki value lagaye hue paise se upar rahi.",
    ),
    seeSample: e("See the sample SIP", "Sample SIP देखें", "Sample SIP dekho"),
    /** NEW. The small shortcut that jumps the replay to the setback month. */
    skip: e("Skip to the setback", "Setback पर जाएँ", "Setback par jaayein"),
    /** NEW. For a SIP with fewer than 12 months of prices: the same claim, only up to the last month we have. */
    noSetbackYet: e(
      "No setback so far: at every month-end from month 4 to {n}, your value stayed above what you put in.",
      "अब तक कोई setback नहीं: महीना 4 से {n} तक हर महीने के आख़िर में आपकी value लगाए हुए पैसे से ऊपर रही।",
      "Ab tak koi setback nahi: mahina 4 se {n} tak har mahine ke aakhir mein aapki value lagaye hue paise se upar rahi.",
    ),
    /** NEW. A SIP that has fewer than 4 months of prices has no month to look at yet. */
    tooEarly: e(
      "This SIP has fewer than 4 months of prices, so there is no setback to look for yet.",
      "इस SIP की 4 महीने से कम की कीमतें हैं, इसलिए अभी देखने के लिए कोई setback नहीं है।",
      "Is SIP ki 4 mahine se kam ki keematein hain, isliye abhi dekhne ke liye koi setback nahi hai.",
    ),
  },

  /** 5. Helper card. */
  helper: {
    hello: e(
      "Hi, I'm here to help you understand what happened.",
      "नमस्ते, मैं ये समझने में आपकी मदद के लिए हूँ कि क्या हुआ।",
      "Namaste, main ye samajhne mein aapki madad ke liye hoon ki kya hua.",
    ),
    ask: e(
      "Your ₹{invested} is now ₹{value}. What do you think happened?",
      "आपके ₹{invested} अब ₹{value} हैं। आपको क्या लगता है, क्या हुआ?",
      "Aapke ₹{invested} ab ₹{value} hain. Aapko kya lagta hai, kya hua?",
    ),
    optFund: e("My fund did badly", "मेरा fund खराब चला", "Mera fund kharab chala"),
    optMarket: e("The whole market fell", "पूरा market गिरा", "Poora market gira"),
    optDunno: e("I don't know", "पता नहीं", "Pata nahi"),
    optWorth: e("It doesn't feel worth it", "ये worth it नहीं लग रहा", "Ye worth it nahi lag raha"),
    barMarket: e("Whole market (Nifty 50)", "पूरा market (Nifty 50)", "Poora market (Nifty 50)"),
    barFund: e("Your fund", "आपका fund", "Aapka fund"),
    /** NEW. The dates under the two bars. */
    between: e("{from} to {to}", "{from} से {to} तक", "{from} se {to} tak"),
    got: e("Got it", "समझ गया", "Samajh gaya"),
    more: e("Ask more", "और पूछो", "Aur poochho"),
    /** NEW. The quick check after the reason: the same question again, now with the reason in front of them. The four taps are the same as the first guess (optFund and the rest), so it cannot pass by chance half the time. */
    checkAsk: e(
      "Quick check: this month, what moved your money most?",
      "एक छोटा सवाल: इस महीने आपके पैसे को सबसे ज़्यादा किसने हिलाया?",
      "Ek chhota sawaal: is mahine aapke paise ko sabse zyada kisne hilaya?",
    ),
    checkThanks: e("Thanks. That helps us make this clearer.", "शुक्रिया। इससे हमें इसे और साफ़ बनाने में मदद मिलती है।", "Shukriya. Isse humein ise aur saaf banane mein madad milti hai."),
  },

  /** 5b. Reason templates, one per case. Also the safe version when an AI check fails. */
  reason: {
    SAME: e(
      "This month the whole market (Nifty 50) fell {m}. Your fund fell {f}, about the same as the market.",
      "इस महीने पूरा market (Nifty 50) {m} गिरा। आपका fund {f} गिरा, लगभग market जितना ही।",
      "Is mahine poora market (Nifty 50) {m} gira. Aapka fund {f} gira, lagbhag market jitna hi.",
    ),
    FUND_MORE: e(
      "This month the whole market (Nifty 50) fell {m}. Your fund fell more, {f}. So part of this fall is the market and part is your fund.",
      "इस महीने पूरा market (Nifty 50) {m} गिरा। आपका fund उससे ज़्यादा, {f} गिरा। यानी गिरावट का कुछ हिस्सा market का है और कुछ आपके fund का।",
      "Is mahine poora market (Nifty 50) {m} gira. Aapka fund usse zyada, {f} gira. Yaani girawat ka kuch hissa market ka hai aur kuch aapke fund ka.",
    ),
    FUND_LESS: e(
      "This month the whole market (Nifty 50) fell {m}. Your fund fell less, {f}.",
      "इस महीने पूरा market (Nifty 50) {m} गिरा। आपका fund उससे कम, {f} गिरा।",
      "Is mahine poora market (Nifty 50) {m} gira. Aapka fund usse kam, {f} gira.",
    ),
    MARKET_UP: e(
      "This month the whole market (Nifty 50) rose {m}, but your fund fell {f}. This fall is in your fund's price, not in the whole market.",
      "इस महीने पूरा market (Nifty 50) {m} बढ़ा, लेकिन आपका fund {f} गिरा। ये गिरावट आपके fund की कीमत में है, पूरे market में नहीं।",
      "Is mahine poora market (Nifty 50) {m} badha, lekin aapka fund {f} gira. Ye girawat aapke fund ki keemat mein hai, poore market mein nahi.",
    ),
    FUND_UP: e(
      "Your fund rose {f} this month, but your value is still ₹{gap} below what you put in. Some of your instalments bought units at a higher price than today's.",
      "इस महीने आपका fund {f} बढ़ा, फिर भी आपकी value लगाए हुए पैसे से ₹{gap} कम है। आपकी कुछ किस्तों ने units आज से ऊँची कीमत पर खरीदे थे।",
      "Is mahine aapka fund {f} badha, phir bhi aapki value lagaye hue paise se ₹{gap} kam hai. Aapki kuch kishton ne units aaj se oonchi keemat par khareede the.",
    ),
  },

  /** 5c. Opening lines. Each one comes before the reason. */
  opening: {
    fundNotJust: e("This fall isn't just your fund.", "ये गिरावट सिर्फ़ आपके fund की नहीं है।", "Ye girawat sirf aapke fund ki nahi hai."),
    partlyRight: e("Partly right.", "आधा सही।", "Aadha sahi."),
    readRight: e("You read it right.", "आपने सही समझा।", "Aapne sahi samjha."),
    fundDidntFall: e("Your fund didn't fall this month.", "इस महीने आपका fund नहीं गिरा।", "Is mahine aapka fund nahi gira."),
    notQuite: e("The market is not the reason this month.", "इस महीने market वजह नहीं है।", "Is mahine market wajah nahi hai."),
    dunno: e(
      "That's a common question.",
      "कोई बात नहीं, ये सवाल बहुत लोगों का होता है।",
      "Koi baat nahi, ye sawaal bahut logon ka hota hai.",
    ),
    dunnoSecond: e(
      "Your money moves with the share market.",
      "आपका पैसा share market के साथ ऊपर-नीचे होता है।",
      "Aapka paisa share market ke saath upar-neeche hota hai.",
    ),
    worth: e(
      "Your {months} months so far: you've put in ₹{invested}, and today it's worth ₹{value}.",
      "आपके {months} महीनों का हिसाब: आपने ₹{invested} लगाए, आज उनकी value ₹{value} है।",
      "Aapke {months} mahino ka hisaab: aapne ₹{invested} lagaye, aaj unki value ₹{value} hai.",
    ),
  },

  /** 5d. The reason line that stays next to the value after "Got it". */
  line: {
    reasonLine: e(
      "{month}: market {mVerb} {m}, your fund {fVerb} {f}.",
      "{month}: market {m} {mVerb}, आपका fund {f} {fVerb}।",
      "{month}: market {m} {mVerb}, aapka fund {f} {fVerb}.",
    ),
    fell: e("fell", "गिरा", "gira"),
    rose: e("rose", "बढ़ा", "badha"),
  },

  /** 6. Follow-up ("Ask more"). Phase 2 shows fixed text only. */
  followup: {
    title: e("Ask more", "और पूछो", "Aur poochho"),
    hint: e("Ask anything about your SIP", "अपनी SIP के बारे में कुछ भी पूछें", "Apni SIP ke baare mein kuch bhi poochiye"),
    send: e("Send", "भेजें", "Bhejo"),
    back: e("Back", "वापस", "Wapas"),
    /** NEW. Shown when a written answer fails a check: the safe version, with the person's own numbers. */
    checkFailed: e(
      "I couldn't write a checked answer to that. What I can say from your numbers: {line}",
      "मैं इसका check किया हुआ जवाब नहीं लिख पाया। आपके numbers से इतना कह सकता हूँ: {line}",
      "Main iska check kiya hua jawab nahi likh paaya. Aapke numbers se itna keh sakta hoon: {line}",
    ),
    /** NEW. The free-text box is limited to questions about this SIP. */
    thinking: e("Checking your numbers...", "आपके numbers check हो रहे हैं...", "Aapke numbers check ho rahe hain..."),
    /** NEW. The reply to the two questions that the next version will answer from the numbers. */
    comingNext: e("Coming in the next version", "अगले version में आएगा", "Agle version mein aayega"),
    qStop: e("What happens if I stop now?", "अगर मैं अभी रोक दूँ तो क्या होगा?", "Agar main abhi rok doon to kya hoga?"),
    qWorse: e(
      "Did my fund do worse than the market?",
      "क्या मेरा fund market से खराब चला?",
      "Kya mera fund market se kharab chala?",
    ),
    /** Version 2. Replaces the suggested "Should I switch to another fund?", which led people into a refusal. */
    qTypes: e("What is a small cap fund?", "Small cap fund क्या होता है?", "Small cap fund kya hota hai?"),
    qLast: e("How long will this fall last?", "ये गिरावट कब तक रहेगी?", "Ye girawat kab tak rahegi?"),
    /** One short line, no discussion of the question (founder, after the eval version 3 review). */
    safeAdvice: e(
      "This is outside what I can help with. I don't say which fund to choose or change.",
      "ये मेरी मदद के दायरे से बाहर है। मैं नहीं बताता कि कौन सा fund चुनें या बदलें।",
      "Ye meri madad ke daayre se bahar hai. Main nahi batata ki kaunsa fund chunein ya badlein.",
    ),
    safePredict: e(
      "This is outside what I can help with. A mutual fund moves with the market, so nobody can tell you this.",
      "ये मेरी मदद के दायरे से बाहर है। Mutual fund market के साथ ऊपर-नीचे होता है, इसलिए ये कोई नहीं बता सकता।",
      "Ye meri madad ke daayre se bahar hai. Mutual fund market ke saath upar-neeche hota hai, isliye ye koi nahi bata sakta.",
    ),
    safeOff: e(
      "I can only answer questions about this SIP and what happened to it.",
      "मैं सिर्फ़ इस SIP और इसके साथ क्या हुआ, इसी के बारे में बता सकता हूँ।",
      "Main sirf is SIP aur iske saath kya hua, isi ke baare mein bata sakta hoon.",
    ),
    /** Version 2. A button below the advice refusal. It shows facts only when tapped and answers nothing about choosing. */
    offerButton: e("Show me my facts", "मेरे facts दिखाइए", "Mere facts dikhaiye"),
    adviser: e(
      "For advice on your own situation, you can speak to a SEBI-registered investment adviser.",
      "अपनी स्थिति पर सलाह के लिए आप किसी SEBI-registered investment adviser से बात कर सकते हैं।",
      "Apni situation par salaah ke liye aap kisi SEBI-registered investment adviser se baat kar sakte hain.",
    ),
  },
} as const;

/** Full month names. NEW: the copy deck only shows "March 2025" as an example. */
export const MONTH_NAMES: Record<Lang, readonly string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
  hn: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

/** The AMFI investor-education page: English gets the English page, Hindi and Hinglish get the Hindi page. */
export const AMFI_LINK: Record<Lang, string> = {
  en: "https://www.mutualfundssahihai.com/en",
  hi: "https://www.mutualfundssahihai.com/hi",
  hn: "https://www.mutualfundssahihai.com/hi",
};

/** Values for the `{braces}` in a string. */
export type TemplateValues = Readonly<Record<string, string | number>>;

/**
 * Fills the `{braces}` in a string. A rupee sign in front of a brace is part of the template ("₹{amount}"),
 * so a money value that already carries its own sign ("₹40,000") replaces the sign and the brace together.
 * A brace with no value is left as it is, so a missing value shows up in a test instead of vanishing.
 */
export function fillTemplate(template: string, values: TemplateValues = {}): string {
  return template.replace(/(₹)?\{(\w+)\}/g, (whole, rupee: string | undefined, key: string) => {
    if (!(key in values)) return whole;
    const value = String(values[key]);
    if (rupee && value.startsWith("₹")) return value;
    return `${rupee ?? ""}${value}`;
  });
}

/** One string in one language, with its braces filled. */
export function t(entry: Entry, lang: Lang, values?: TemplateValues): string {
  return fillTemplate(entry[lang], values);
}

/** "2026-03" -> "March 2026" or "मार्च 2026". */
export function monthName(isoMonth: string, lang: Lang): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return `${MONTH_NAMES[lang][month - 1]} ${year}`;
}
