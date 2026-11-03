import type { Entry } from "./dictionary";

/**
 * The first-visit notice and the About popup (same content, as in the attempt-one MVP). Every claim about data
 * matches the code: no personal data asked; NAVs from AMFI via mfapi.in; the SIP numbers and the question go to
 * OpenAI to write words; questions and answers are not stored; anonymous events go to Vercel Analytics; 40 AI calls
 * per visitor every 10 minutes (src/lib/api/rate-limit.ts). Raise CONSENT_VERSION when this changes. No em dashes.
 */
const e = (en: string, hi: string, hn: string): Entry => ({ en, hi, hn });

export const consentCopy = {
  title: e("Before you start", "शुरू करने से पहले", "Shuru karne se pehle"),
  aboutTitle: e("About this project", "इस project के बारे में", "Is project ke baare mein"),
  infoLabel: e("About this project", "इस project के बारे में", "Is project ke baare mein"),
  close: e("Close", "बंद करें", "Band karein"),

  whatTitle: e("What this is", "ये क्या है", "Ye kya hai"),
  what: e(
    "A concept for a Groww feature, built for a product management graduation project. It is not made by or linked to Groww.",
    "Groww के एक feature का concept, जो एक product management graduation project के लिए बनाया गया है। ये Groww ने नहीं बनाया और Groww से जुड़ा नहीं है।",
    "Groww ke ek feature ka concept, jo ek product management graduation project ke liye banaya gaya hai. Ye Groww ne nahi banaya aur Groww se juda nahi hai.",
  ),
  notAdvice: e(
    "It is not investment advice. It never tells you what to buy, sell or do.",
    "ये निवेश सलाह नहीं है। ये कभी नहीं बताता कि क्या खरीदें, क्या बेचें या क्या करें।",
    "Ye investment advice nahi hai. Ye kabhi nahi batata ki kya khareedein, kya bechein ya kya karein.",
  ),
  finding: e(
    "In our research, 3 of 4 people who stopped their SIP in the first year did so after a fall or low returns. So this helper explains the fall, in your language, before you decide anything.",
    "हमारी research में, पहले साल में SIP रोकने वाले 4 में से 3 लोगों ने ऐसा किसी गिरावट या कम returns के बाद किया। इसलिए ये helper आपके कोई भी फ़ैसला लेने से पहले, आपकी भाषा में, गिरावट समझाता है।",
    "Hamari research mein, pehle saal mein SIP rokne wale 4 mein se 3 logon ne aisa kisi girawat ya kam returns ke baad kiya. Isliye ye helper aapke koi bhi faisla lene se pehle, aapki bhasha mein, girawat samjhaata hai.",
  ),

  howTitle: e("How to use it", "इसे कैसे इस्तेमाल करें", "Ise kaise use karein"),
  steps: [
    e(
      "Try the sample SIP, or enter your own fund, start month and amount.",
      "Sample SIP देखें, या अपना fund, शुरू का महीना और रकम भरें।",
      "Sample SIP dekhiye, ya apna fund, shuru ka mahina aur rakam bhariye.",
    ),
    e(
      "Replay your first year month by month. When your value first falls below what you put in, the helper asks what you think happened.",
      "अपना पहला साल महीने-दर-महीने चलाकर देखें। जब value पहली बार लगाए हुए पैसे से नीचे जाती है, helper पूछता है कि आपको क्या लगता है।",
      "Apna pehla saal mahine-dar-mahine chala ke dekhiye. Jab value pehli baar lagaye hue paise se neeche jaati hai, helper poochta hai ki aapko kya lagta hai.",
    ),
    e(
      "See what really moved your money, ask your own questions, and learn the basics.",
      "देखें कि असल में आपके पैसे को किसने हिलाया, अपने सवाल पूछें, और बुनियादी बातें समझें।",
      "Dekhiye ki asal mein aapke paise ko kisne hilaya, apne sawaal poochiye, aur basic baatein samjhiye.",
    ),
  ],

  dataTitle: e("What happens to your data", "आपके data का क्या होता है", "Aapke data ka kya hota hai"),
  data: e(
    "We never ask for your name, phone, PAN or account. Fund prices come from AMFI's public data (via mfapi.in). To write the explanation and answer your questions, your SIP's numbers and your question are sent to OpenAI; every number is worked out in our code, not by the AI. We do not store your questions or answers. We count anonymous taps (for example, which guess was chosen) with Vercel Analytics to learn what works. OpenAI may keep requests for a short time under its own API policy.",
    "हम कभी आपका नाम, phone, PAN या account नहीं माँगते। Fund की कीमतें AMFI के public data (mfapi.in के ज़रिए) से आती हैं। समझाने और आपके सवालों के जवाब देने के लिए आपकी SIP के numbers और आपका सवाल OpenAI को भेजे जाते हैं; हर number हमारे code में निकाला जाता है, AI से नहीं। हम आपके सवाल या जवाब store नहीं करते। क्या काम करता है, ये समझने के लिए हम Vercel Analytics से anonymous taps गिनते हैं (जैसे कौन सा अंदाज़ा चुना गया)। OpenAI अपनी API policy के तहत requests कुछ समय तक रख सकता है।",
    "Hum kabhi aapka naam, phone, PAN ya account nahi maangte. Fund ki keematein AMFI ke public data (mfapi.in ke zariye) se aati hain. Samjhaane aur aapke sawaalon ke jawab dene ke liye aapki SIP ke numbers aur aapka sawaal OpenAI ko bheje jaate hain; har number hamare code mein nikala jaata hai, AI se nahi. Hum aapke sawaal ya jawab store nahi karte. Kya kaam karta hai, ye samajhne ke liye hum Vercel Analytics se anonymous taps ginte hain (jaise kaunsa andaaza chuna gaya). OpenAI apni API policy ke tahat requests kuch samay tak rakh sakta hai.",
  ),

  limitsTitle: e("Limits", "सीमाएँ", "Limits"),
  limits: e(
    "This free prototype uses a paid AI service, so each visitor can make about 40 AI requests every 10 minutes. After that you still see the explanation written by our code.",
    "ये free prototype एक paid AI service इस्तेमाल करता है, इसलिए हर visitor हर 10 मिनट में लगभग 40 AI requests कर सकता है। उसके बाद भी आपको हमारे code का लिखा हुआ explanation दिखता रहेगा।",
    "Ye free prototype ek paid AI service use karta hai, isliye har visitor har 10 minute mein lagbhag 40 AI requests kar sakta hai. Uske baad bhi aapko hamare code ka likha hua explanation dikhta rahega.",
  ),

  renew: e(
    "We will show this again after 5 hours. You can read it any time from the i button at the top.",
    "हम इसे 5 घंटे बाद फिर दिखाएँगे। आप इसे कभी भी ऊपर के i button से पढ़ सकते हैं।",
    "Hum ise 5 ghante baad phir dikhayenge. Aap ise kabhi bhi upar ke i button se padh sakte hain.",
  ),
  agree: e(
    "I understand this is a graduation project, not investment advice, and how my data is used.",
    "मैं समझता/समझती हूँ कि ये एक graduation project है, निवेश सलाह नहीं, और मेरा data कैसे इस्तेमाल होता है।",
    "Main samajhta/samajhti hoon ki ye ek graduation project hai, investment advice nahi, aur mera data kaise use hota hai.",
  ),
  start: e("Get started", "शुरू करें", "Shuru karein"),
  agreedOn: e(
    "You agreed on {time}. We will ask again after {renew}.",
    "आपने {time} को सहमति दी। हम {renew} के बाद फिर पूछेंगे।",
    "Aapne {time} ko sahmati di. Hum {renew} ke baad phir poochhenge.",
  ),
  visitOnly: e(
    "You agreed for this visit. Your browser did not let us remember it, so we will ask again next time.",
    "आपने इस visit के लिए सहमति दी। आपके browser ने इसे याद रखने नहीं दिया, इसलिए अगली बार फिर पूछेंगे।",
    "Aapne is visit ke liye sahmati di. Aapke browser ne ise yaad rakhne nahi diya, isliye agli baar phir poochhenge.",
  ),
};
