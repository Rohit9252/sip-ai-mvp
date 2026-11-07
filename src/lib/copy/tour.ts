import type { Entry } from "./dictionary";

/**
 * Words for the first-visit tour and the desktop layout, in the same three languages and plain style as
 * dictionary.ts. Kept apart so the tour can change without touching the reviewed copy deck. No em dashes.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export type TourStep = { target: string; title: Entry; body: Entry };

export const tourCopy = {
  next: e("Next", "आगे", "Aage"),
  back: e("Back", "पीछे", "Peeche"),
  skip: e("Skip tour", "Tour छोड़ें", "Tour chhodo"),
  done: e("Start", "शुरू करें", "Shuru karein"),
  stepOf: e("{n} of {total}", "{total} में से {n}", "{total} mein se {n}"),
  replay: e("Show me around", "मुझे घुमाकर दिखाएँ", "Mujhe ghuma ke dikhao"),
};

/** The set-up screen: what this is, the language, the sample, and your own SIP. */
export const setupTour: TourStep[] = [
  {
    target: "strip",
    title: e("A graduation project, not advice", "एक graduation project, सलाह नहीं", "Ek graduation project, salaah nahi"),
    body: e(
      "This shows how a Groww SIP page could explain a fall. It is a graduation project, not made by Groww, and never tells you what to do.",
      "ये दिखाता है कि Groww का SIP page एक गिरावट को कैसे समझा सकता है। ये एक graduation project है, Groww ने नहीं बनाया, और ये कभी नहीं बताता कि आप क्या करें।",
      "Ye dikhata hai ki Groww ka SIP page ek girawat ko kaise samjha sakta hai. Ye ek graduation project hai, Groww ne nahi banaya, aur ye kabhi nahi batata ki aap kya karein.",
    ),
  },
  {
    target: "lang",
    title: e("Your language", "आपकी भाषा", "Aapki bhasha"),
    body: e(
      "Read everything in English, Hindi or Hinglish. Switch any time.",
      "सब कुछ English, हिंदी या Hinglish में पढ़ें। कभी भी बदलें।",
      "Sab kuch English, Hindi ya Hinglish mein padhein. Kabhi bhi badlein.",
    ),
  },
  {
    target: "sample",
    title: e("Start with a real sample", "एक असली sample से शुरू करें", "Ek asli sample se shuru karein"),
    body: e(
      "Pick a monthly amount close to yours and replay a real fund on real prices. Its first fall comes in month 8.",
      "अपनी जैसी monthly रकम चुनें और एक असली fund को असली कीमतों पर चलाकर देखें। इसकी पहली गिरावट महीना 8 में आती है।",
      "Apni jaisi monthly rakam chuniye aur ek asli fund ko asli keematon par chala ke dekhiye. Iski pehli girawat mahina 8 mein aati hai.",
    ),
  },
  {
    target: "form",
    title: e("Or try your own SIP", "या अपनी SIP देखें", "Ya apni SIP dekho"),
    body: e(
      "Pick your fund, start month and amount. We never ask for your name, phone or PAN.",
      "अपना fund, शुरू का महीना और रकम चुनें। हम कभी आपका नाम, phone या PAN नहीं माँगते।",
      "Apna fund, shuru ka mahina aur rakam chuniye. Hum kabhi aapka naam, phone ya PAN nahi maangte.",
    ),
  },
];

/** The SIP page: the numbers, the chart, the replay, and the stop button that never moves. */
export const sipTour: TourStep[] = [
  {
    target: "stats",
    title: e("Your money at a glance", "एक नज़र में आपका पैसा", "Ek nazar mein aapka paisa"),
    body: e(
      "What your SIP is worth, what you put in, and the difference, with an arrow and a sign so colour is never the only clue.",
      "आपकी SIP की value, आपने कितना लगाया, और दोनों का फ़र्क, तीर और निशान के साथ, ताकि सिर्फ़ रंग पर न टिकना पड़े।",
      "Aapki SIP ki value, aapne kitna lagaya, aur dono ka farq, teer aur nishaan ke saath, taaki sirf rang par na tikna pade.",
    ),
  },
  {
    target: "chart",
    title: e("Returns over time", "समय के साथ returns", "Samay ke saath returns"),
    body: e(
      "The dashed line is what you put in. When the line goes under it, your SIP is worth less than you put in.",
      "Dashed line आपका लगाया हुआ पैसा है। जब line उसके नीचे जाती है, तो आपकी SIP की value लगाए हुए पैसे से कम होती है।",
      "Dashed line aapka lagaya hua paisa hai. Jab line uske neeche jaati hai, to aapki SIP ki value lagaye hue paise se kam hoti hai.",
    ),
  },
  {
    target: "replay",
    title: e("Walk your first year", "अपना पहला साल देखें", "Apna pehla saal dekho"),
    body: e(
      "Move one month at a time. At the first month your value falls below what you put in, the helper steps in.",
      "एक-एक महीना आगे बढ़ें। जिस महीने पहली बार value लगाए हुए पैसे से नीचे जाएगी, helper आपसे बात करेगा।",
      "Ek-ek mahina aage badho. Jis mahine pehli baar value lagaye hue paise se neeche jaayegi, helper aapse baat karega.",
    ),
  },
  {
    target: "stop",
    title: e("The way out stays put", "बाहर का रास्ता अपनी जगह रहता है", "Bahar ka raasta apni jagah rehta hai"),
    body: e(
      "Stop SIP and Withdraw never move or hide. They show you the facts first, then do what you choose. Nothing real changes in this concept.",
      "SIP रोकें और पैसे निकालें के बटन कभी नहीं हिलते या छिपते। पहले तथ्य दिखते हैं, फिर वही होता है जो आप चुनें। इस concept में कुछ असली नहीं बदलता।",
      "SIP roko aur paise nikalo ke button kabhi nahi hilte ya chhupte. Pehle facts dikhte hain, phir wahi hota hai jo aap chunein. Is concept mein kuch asli nahi badalta.",
    ),
  },
];

/** The desktop layout: the side panel before the setback, and the month-by-month list. */
export const deskCopy = {
  crumb: e("Mutual funds", "Mutual funds", "Mutual funds"),
  page: e("Your SIP", "आपकी SIP", "Aapki SIP"),
  conceptPill: e("Graduation project · not investment advice", "Graduation project · निवेश सलाह नहीं", "Graduation project · investment advice nahi"),
  monthOfSip: e("Month of SIP", "SIP का महीना", "SIP ka mahina"),
  helperTitle: e("Your helper", "आपका helper", "Aapka helper"),
  helperWaiting: e(
    "When your value first falls below what you put in, I'll ask what you think happened, then show what moved your money.",
    "जब आपकी value पहली बार लगाए हुए पैसे से नीचे जाएगी, मैं पूछूँगा कि आपको क्या लगता है, फिर दिखाऊँगा कि आपके पैसे को किसने हिलाया।",
    "Jab aapki value pehli baar lagaye hue paise se neeche jaayegi, main poochhunga ki aapko kya lagta hai, phir dikhaunga ki aapke paise ko kisne hilaya.",
  ),
  firstYear: e("Your first year, month by month", "आपका पहला साल, महीने-दर-महीने", "Aapka pehla saal, mahine-dar-mahine"),
  setbackTag: e("First setback", "पहला setback", "Pehla setback"),
  month: e("Month", "महीना", "Mahina"),
  introTitle: e(
    "See what moved your SIP, in your language",
    "अपनी भाषा में देखें कि आपकी SIP को किसने हिलाया",
    "Apni bhasha mein dekhein ki aapki SIP ko kisne hilaya",
  ),
  trust: [
    {
      title: e("Real prices", "असली कीमतें", "Asli keematein"),
      body: e(
        "Every number is worked out from AMFI fund prices, never by the AI.",
        "हर number AMFI की fund कीमतों से निकाला जाता है, AI से कभी नहीं।",
        "Har number AMFI ki fund keematon se nikala jaata hai, AI se kabhi nahi.",
      ),
    },
    {
      title: e("Checked AI", "जाँचा हुआ AI", "Jaancha hua AI"),
      body: e(
        "The reason is written by code. The AI only answers your follow-up questions, in words, and every reply is checked against your numbers before you see it.",
        "वजह code लिखता है। AI सिर्फ़ आपके follow-up सवालों के जवाब देता है, और हर जवाब आपको दिखने से पहले आपके numbers से जाँचा जाता है।",
        "Wajah code likhta hai. AI sirf aapke follow-up sawaalon ke jawab deta hai, aur har jawab aapko dikhne se pehle aapke numbers se jaancha jaata hai.",
      ),
    },
    {
      title: e("Never advice", "कभी सलाह नहीं", "Kabhi salaah nahi"),
      body: e(
        "Questions about what to buy, sell or expect get a fixed safe answer.",
        "क्या खरीदें, बेचें या आगे क्या होगा, ऐसे सवालों पर हमेशा एक तय safe जवाब मिलता है।",
        "Kya khareedein, bechein ya aage kya hoga, aise sawaalon par hamesha ek tay safe jawab milta hai.",
      ),
    },
  ],
  introSteps: [
    e("Replay your SIP month by month, on real fund prices.", "अपनी SIP को असली कीमतों पर महीने-दर-महीने चलाकर देखें।", "Apni SIP ko asli keematon par mahine-dar-mahine chala ke dekhein."),
    e("At the first fall, say what you think happened.", "पहली गिरावट पर बताएँ कि आपको क्या लगता है।", "Pehli girawat par bataiye ki aapko kya lagta hai."),
    e("See your fund against the whole market, and ask more.", "अपने fund को पूरे market के सामने देखें, और सवाल पूछें।", "Apne fund ko poore market ke saamne dekhein, aur sawaal poochiye."),
  ],
};

/** The sample SIP: the person picks the monthly amount, so the numbers feel like their own. */
export const sampleCopy = {
  title: e("Try a sample SIP", "Sample SIP देखें", "Sample SIP dekho"),
  body: e(
    "We replay a real fund, HDFC Flexi Cap (Direct, Growth), from August 2025 on real prices. Pick a monthly amount close to what you put in, so the numbers feel like yours.",
    "हम एक असली fund, HDFC Flexi Cap (Direct, Growth), को August 2025 से असली कीमतों पर चलाकर दिखाते हैं। अपनी जैसी monthly रकम चुनें, ताकि numbers आपके अपने लगें।",
    "Hum ek asli fund, HDFC Flexi Cap (Direct, Growth), ko August 2025 se asli keematon par chala ke dikhate hain. Apni jaisi monthly rakam chuniye, taaki numbers aapke apne lagein.",
  ),
  why: e(
    "Why we ask: this is how we test the moment we built for. At any amount the first fall comes in month 8; the percent moves stay the same, only the rupees change.",
    "क्यों पूछ रहे हैं: इसी से हम उस पल को test करते हैं जिसके लिए ये बना है। किसी भी रकम पर पहली गिरावट महीना 8 में आती है; % वही रहते हैं, सिर्फ़ रुपये बदलते हैं।",
    "Kyun pooch rahe hain: isi se hum us pal ko test karte hain jiske liye ye bana hai. Kisi bhi rakam par pehli girawat mahina 8 mein aati hai; % wahi rehte hain, sirf rupaye badalte hain.",
  ),
  amount: e("Monthly amount", "हर महीने की रकम", "Har mahine ki rakam"),
  own: e("Or type your own", "या अपनी रकम लिखें", "Ya apni rakam likhiye"),
  start: e("Start the replay", "Replay शुरू करें", "Replay shuru karein"),
  cancel: e("Cancel", "रद्द करें", "Cancel"),
};

/** Quick picks for the sample. First-timers usually start small, so Rs 1,000 is the default. */
export const SAMPLE_AMOUNTS = [500, 1000, 2000, 5000] as const;
export const SAMPLE_DEFAULT_AMOUNT = 1000;

/**
 * A short, warm line after the reason. It praises understanding, never continuing: no "keep going", no "stay
 * invested", no "don't worry" (the brief bans nudges). What the person does next stays their call.
 */
export const cheerCopy = {
  right: e(
    "Spot on. You read your own money right in a tough month. Knowing why it moved puts you in charge of what comes next.",
    "बिल्कुल सही। एक मुश्किल महीने में भी आपने अपने पैसे को सही पढ़ा। ये जानना कि पैसा क्यों हिला, आगे के फ़ैसले आपके हाथ में रखता है।",
    "Bilkul sahi. Ek mushkil mahine mein bhi aapne apne paise ko sahi padha. Ye jaanna ki paisa kyun hila, aage ke faisle aapke haath mein rakhta hai.",
  ),
  misread: e(
    "It's natural to blame your own fund in a month like this. You checked instead, and now you know the real reason. That puts you in charge of what comes next.",
    "ऐसे महीने में अपने fund को दोष देना स्वाभाविक है। आपने अंदाज़ा लगाने की जगह जाँचा, और अब आप असली वजह जानते हैं। इससे आगे के फ़ैसले आपके हाथ में रहते हैं।",
    "Aise mahine mein apne fund ko dosh dena natural hai. Aapne andaaza lagaane ki jagah jaancha, aur ab aap asli wajah jaante hain. Isse aage ke faisle aapke haath mein rehte hain.",
  ),
  asked: e(
    "Good question to ask. Now you know what moved your money, in plain numbers. Whatever you decide next, you'll decide it knowing why.",
    "पूछना बिल्कुल सही था। अब आप साफ़ numbers में जानते हैं कि आपके पैसे को किसने हिलाया। आगे जो भी तय करें, वजह जानकर तय करेंगे।",
    "Poochhna bilkul sahi tha. Ab aap saaf numbers mein jaante hain ki aapke paise ko kisne hilaya. Aage jo bhi tay karein, wajah jaan kar tay karenge.",
  ),
  worth: e(
    "Feeling unsure after a fall is completely human. Now you can see where your money stands and why it moved. What you do next stays your call.",
    "गिरावट के बाद मन में शक आना बिल्कुल इंसानी है। अब आप देख सकते हैं कि आपका पैसा कहाँ है और क्यों हिला। आगे क्या करना है, ये आपका ही फ़ैसला है।",
    "Girawat ke baad mann mein shak aana bilkul insaani hai. Ab aap dekh sakte hain ki aapka paisa kahan hai aur kyun hila. Aage kya karna hai, ye aapka hi faisla hai.",
  ),
  learnHint: e("Want the basics behind this?", "इसके पीछे की बुनियादी बातें जानना चाहेंगे?", "Iske peeche ki basic baatein jaanna chahenge?"),
  typing: e("Helper is checking your numbers", "Helper आपके numbers check कर रहा है", "Helper aapke numbers check kar raha hai"),
};

/** The helper's own tour, in two parts: when it first opens, and when its first answer arrives. */
export const helperTourAsk: TourStep[] = [
  {
    target: "helper-ask",
    title: e("Your helper steps in at the first fall", "पहली गिरावट पर आपका helper आता है", "Pehli girawat par aapka helper aata hai"),
    body: e(
      "When your value first goes below what you put in, the helper asks one question. It never tells you what to do: it explains what happened.",
      "जब आपकी value पहली बार लगाए हुए पैसे से नीचे जाती है, helper एक सवाल पूछता है। ये कभी नहीं बताता कि आप क्या करें: ये समझाता है कि क्या हुआ।",
      "Jab aapki value pehli baar lagaye hue paise se neeche jaati hai, helper ek sawaal poochta hai. Ye kabhi nahi batata ki aap kya karein: ye samjhaata hai ki kya hua.",
    ),
  },
  {
    target: "helper-choices",
    title: e("Tap what you think happened", "जो लगता है, वो tap करें", "Jo lagta hai, wo tap karein"),
    body: e(
      "There is no wrong answer. Your guess lets the helper start from what you were thinking.",
      "कोई जवाब गलत नहीं है। आपके अंदाज़े से helper वहीं से शुरू करता है जो आप सोच रहे थे।",
      "Koi jawab galat nahi hai. Aapke andaaze se helper wahin se shuru karta hai jo aap soch rahe the.",
    ),
  },
];

export const helperTourAnswer: TourStep[] = [
  {
    target: "helper-answer",
    title: e("What really moved your money", "आपके पैसे को असल में किसने हिलाया", "Aapke paise ko asal mein kisne hilaya"),
    body: e(
      "Your fund against the whole market (Nifty 50) in the same month. Every number comes from real fund prices and is checked before you see it.",
      "उसी महीने में आपका fund बनाम पूरा market (Nifty 50)। हर number असली fund कीमतों से आता है और दिखाने से पहले जाँचा जाता है।",
      "Usi mahine mein aapka fund banaam poora market (Nifty 50). Har number asli fund keematon se aata hai aur dikhane se pehle jaancha jaata hai.",
    ),
  },
  {
    target: "helper-chat",
    title: e("Ask your own questions", "अपने सवाल पूछें", "Apne sawaal poochiye"),
    body: e(
      "Ask in English, Hindi or Hinglish, or tap a suggestion. Questions about what to buy, sell or expect always get a safe answer, never advice.",
      "English, हिंदी या Hinglish में पूछें, या कोई सुझाव tap करें। क्या खरीदें, बेचें या आगे क्या होगा, ऐसे सवालों पर हमेशा safe जवाब मिलता है, सलाह कभी नहीं।",
      "English, Hindi ya Hinglish mein poochiye, ya koi suggestion tap kijiye. Kya khareedein, bechein ya aage kya hoga, aise sawaalon par hamesha safe jawab milta hai, salaah kabhi nahi.",
    ),
  },
  {
    target: "helper-gotit",
    title: e("Keep the reason with you", "वजह अपने साथ रखें", "Wajah apne saath rakhein"),
    body: e(
      "Tap Got it and the reason stays next to your value. You can open the helper again any time.",
      "Got it दबाएँ और वजह आपकी value के पास रहेगी। Helper को आप कभी भी फिर खोल सकते हैं।",
      "Got it dabaiye aur wajah aapki value ke paas rahegi. Helper ko aap kabhi bhi phir khol sakte hain.",
    ),
  },
];
