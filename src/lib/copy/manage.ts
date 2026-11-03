import type { Entry } from "./dictionary";

/**
 * Words for managing the SIP: stop, skip one instalment, withdraw, and the optional reason. Facts only: no fear, no
 * "are you sure", no urgency (the brief). Stopping stays one tap away. Same three languages and style as
 * dictionary.ts. No em dashes.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export const STOP_REASONS = ["money", "returns", "confused", "moving", "other"] as const;
export type StopReason = (typeof STOP_REASONS)[number];

export const manageCopy = {
  title: e("Manage your SIP", "अपनी SIP संभालें", "Apni SIP manage karein"),
  withdrawButton: e("Withdraw", "पैसे निकालें", "Paise nikalo"),
  close: e("Close", "बंद करें", "Band karein"),
  concept: e(
    "This is a concept: nothing here moves real money.",
    "ये एक concept है: यहाँ कोई असली पैसा नहीं हिलता।",
    "Ye ek concept hai: yahan koi asli paisa nahi hilta.",
  ),
  stopTitle: e("Stop SIP", "SIP रोकें", "SIP roko"),
  stopFact: e(
    "Future instalments end. Your {value} stays invested until you withdraw it.",
    "आगे की किस्तें बंद होंगी। आपके {value} तब तक fund में रहेंगे जब तक आप न निकालें।",
    "Aage ki kishtein band hongi. Aapke {value} tab tak fund mein rahenge jab tak aap na nikaalein.",
  ),
  skipTitle: e("Skip next instalment", "अगली किस्त छोड़ें", "Agli kisht chhodo"),
  skipFact: e(
    "Only next month's {amount} is skipped. The SIP carries on after that.",
    "सिर्फ़ अगले महीने के {amount} छूटेंगे। उसके बाद SIP चलती रहेगी।",
    "Sirf agle mahine ke {amount} chhootenge. Uske baad SIP chalti rahegi.",
  ),
  withdrawTitle: e("Withdraw money", "पैसे निकालें", "Paise nikalo"),
  withdrawFact: e(
    "Take out all or part of your {value}. Units under a year old usually carry an exit load of about 1%.",
    "अपने {value} में से पूरा या कुछ हिस्सा निकालें। एक साल से कम पुरानी units पर आमतौर पर लगभग 1% exit load लगता है।",
    "Apne {value} mein se poora ya kuch hissa nikaalein. Ek saal se kam purani units par aam taur par lagbhag 1% exit load lagta hai.",
  ),

  // Withdraw step
  all: e("All", "पूरा", "Poora"),
  part: e("Part", "कुछ हिस्सा", "Kuch hissa"),
  amountLabel: e("Amount to withdraw", "निकालने की रकम", "Nikaalne ki rakam"),
  amountError: e("Enter an amount from ₹1 to {max}.", "₹1 से {max} तक की रकम भरें।", "₹1 se {max} tak ki rakam bhariye."),
  youWithdraw: e("You withdraw", "आप निकालेंगे", "Aap nikaalenge"),
  exitLoad: e("Exit load (about 1%)", "Exit load (लगभग 1%)", "Exit load (lagbhag 1%)"),
  noExitLoad: e("Exit load", "Exit load", "Exit load"),
  youGet: e("You would get about", "आपको लगभग मिलेंगे", "Aapko lagbhag milenge"),
  withdrawNote: e(
    "Tax may apply on any gain. Your fund's page has the exact exit load rule.",
    "किसी भी फ़ायदे पर tax लग सकता है। सही exit load का नियम आपके fund के page पर है।",
    "Kisi bhi fayde par tax lag sakta hai. Sahi exit load ka niyam aapke fund ke page par hai.",
  ),
  continue: e("Continue", "आगे बढ़ें", "Aage badhein"),

  // Reason step
  reasonStop: e("Why are you stopping?", "आप SIP क्यों रोक रहे हैं?", "Aap SIP kyun rok rahe hain?"),
  reasonWithdraw: e("Why are you withdrawing?", "आप पैसे क्यों निकाल रहे हैं?", "Aap paise kyun nikaal rahe hain?"),
  reasonHint: e("Optional. It helps us understand, and changes nothing.", "चाहें तो बताएँ। इससे हमें समझने में मदद मिलती है, कुछ बदलता नहीं।", "Chahein to bataiye. Isse humein samajhne mein madad milti hai, kuch badalta nahi."),
  reasons: {
    money: e("I need the money", "मुझे पैसों की ज़रूरत है", "Mujhe paison ki zaroorat hai"),
    returns: e("Returns are low or falling", "Returns कम हैं या गिर रहे हैं", "Returns kam hain ya gir rahe hain"),
    confused: e("I don't understand what's happening", "समझ नहीं आ रहा कि क्या हो रहा है", "Samajh nahi aa raha ki kya ho raha hai"),
    moving: e("Moving to another fund or app", "दूसरे fund या app में जा रहा हूँ", "Doosre fund ya app mein ja raha hoon"),
    other: e("Something else", "कुछ और", "Kuch aur"),
  } satisfies Record<StopReason, Entry>,
  skipReason: e("Skip this question", "ये सवाल छोड़ें", "Ye sawaal chhodo"),
  seeWhy: e(
    "Want to see what moved your money first?",
    "पहले देखना चाहेंगे कि आपके पैसे को किसने हिलाया?",
    "Pehle dekhna chahenge ki aapke paise ko kisne hilaya?",
  ),
  seeWhyLink: e("See what happened", "देखें क्या हुआ", "Dekhein kya hua"),
  confirmStop: e("Stop SIP", "SIP रोकें", "SIP roko"),
  confirmSkip: e("Skip next instalment", "अगली किस्त छोड़ें", "Agli kisht chhodo"),
  confirmWithdraw: e("Withdraw {amount}", "{amount} निकालें", "{amount} nikaalein"),

  // Done step
  doneTitle: e("Done, in this concept", "हो गया, इस concept में", "Ho gaya, is concept mein"),
  doneStop: e(
    "In the real app, your SIP would stop from next month. Your {value} would stay invested until you withdraw it.",
    "असली app में आपकी SIP अगले महीने से रुक जाती। आपके {value} तब तक fund में रहते जब तक आप न निकालें।",
    "Asli app mein aapki SIP agle mahine se ruk jaati. Aapke {value} tab tak fund mein rehte jab tak aap na nikaalein.",
  ),
  doneSkip: e(
    "In the real app, next month's {amount} would be skipped and the SIP would carry on after.",
    "असली app में अगले महीने के {amount} छूट जाते और उसके बाद SIP चलती रहती।",
    "Asli app mein agle mahine ke {amount} chhoot jaate aur uske baad SIP chalti rehti.",
  ),
  doneWithdraw: e(
    "In the real app, about {get} would reach your bank account in a few working days.",
    "असली app में लगभग {get} कुछ working days में आपके bank account में आ जाते।",
    "Asli app mein lagbhag {get} kuch working days mein aapke bank account mein aa jaate.",
  ),
  backToSip: e("Back to my SIP", "मेरी SIP पर वापस", "Meri SIP par wapas"),
};
