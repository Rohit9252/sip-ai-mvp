# Copy deck: every word on screen, in three languages

**Who it is for:**
- The Phase 2 agent (screens) and the Phase 3 agent (AI guards).
- The founder, to check the Hindi and Hinglish.

**Where it comes from:** the approved mockup (`mockup-v1.html`), with the old name removed and the free-text guess dropped (ADR-0002).

**Rules:**
- Plain words. No em dashes.
- Never advice or predictions. Never "don't worry", "keep going" or "stay invested": those are nudges too.
- Numbers are placeholders in `{braces}`, filled by code (ADR-0001). Moves are shown as positive numbers; the verb (fell or rose) carries the direction.
- English is the default language. All three are switchable on every screen.

Placeholders: `{invested}` `{value}` `{gap}` (invested minus value) `{months}` `{month}` (e.g. "March 2025") `{m}` (market move, e.g. "3.6%") `{f}` (fund move) `{amount}` `{date}` `{n}`.

---

## 1. On every screen

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| strip | Concept for a Groww feature, made for a graduation project. Not made by or linked to Groww. Not investment advice. | Groww के एक feature का concept, एक graduation project के लिए बनाया गया। Groww ने नहीं बनाया, Groww से जुड़ा नहीं। ये निवेश सलाह नहीं है। | Groww ke ek feature ka concept, ek graduation project ke liye banaya gaya. Groww ne nahi banaya, Groww se juda nahi. Ye investment advice nahi hai. |
| langName | English | हिंदी | Hinglish |
| source | NAV: AMFI, via mfapi.in, as of {date} | NAV: AMFI (mfapi.in), {date} तक | NAV: AMFI (mfapi.in), {date} tak |
| tagNumbers | Numbers from your SIP | आपकी SIP के numbers | Aapki SIP ke numbers |
| tagSafe | Safe answer | Safe जवाब | Safe jawab |
| notice | This only explains what happened to your money. It is not investment advice. | ये सिर्फ़ बताता है कि आपके पैसे के साथ क्या हुआ। ये निवेश सलाह नहीं है। | Ye sirf batata hai ki aapke paise ke saath kya hua. Ye investment advice nahi hai. |
| loadError | We couldn't load fund prices right now. Please try again in a minute. | अभी fund की कीमतें नहीं आ पाईं। एक मिनट बाद फिर कोशिश करें। | Abhi fund ki keemat nahi aa paayi. Ek minute baad phir try karein. |

## 2. Set-up screen

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| title | Your SIP | आपकी SIP | Aapki SIP |
| sub | Enter your SIP to see your first year, month by month. We don't ask for your name, phone or PAN. | अपनी SIP भरें और अपना पहला साल महीने-दर-महीने देखें। हम आपका नाम, phone या PAN नहीं माँगते। | Apni SIP bharein aur apna pehla saal mahine-dar-mahine dekhein. Hum aapka naam, phone ya PAN nahi maangte. |
| fund | Fund | Fund | Fund |
| fundHint | Search your fund (Direct, Growth) | अपना fund खोजें (Direct, Growth) | Apna fund search karein (Direct, Growth) |
| start | When did your SIP start? | आपकी SIP कब शुरू हुई? | Aapki SIP kab shuru hui? |
| amount | Monthly amount | हर महीने की रकम | Har mahine ki rakam |
| amountHint | ₹100 to ₹1,00,000 | ₹100 से ₹1,00,000 | ₹100 se ₹1,00,000 |
| day | SIP date each month | हर महीने SIP की तारीख़ | Har mahine SIP ki date |
| show | Show my SIP | मेरी SIP दिखाएँ | Meri SIP dikhao |
| sample | Try a sample SIP | Sample SIP देखें | Sample SIP dekho |
| errFund | Pick a fund from the list. | List में से एक fund चुनें। | List mein se ek fund chuniye. |
| errStart | Pick a month between {min} and {max}. | {min} और {max} के बीच का महीना चुनें। | {min} aur {max} ke beech ka mahina chuniye. |
| errAmount | Enter an amount between ₹100 and ₹1,00,000. | ₹100 से ₹1,00,000 के बीच की रकम भरें। | ₹100 se ₹1,00,000 ke beech ki rakam bhariye. |
| errDay | Pick a date between 1 and 28. | 1 से 28 के बीच की तारीख़ चुनें। | 1 se 28 ke beech ki date chuniye. |

## 3. SIP page

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| invested | Invested | लगाया | Lagaya |
| value | Current value | अभी की value | Abhi ki value |
| returns | Total returns | कुल returns | Total returns |
| monthBadge | Month {n} of your SIP · {month} | आपकी SIP का महीना {n} · {month} | Aapki SIP ka mahina {n} · {month} |
| instalments | {n} instalments · ₹{amount} a month | {n} किस्तें · हर महीने ₹{amount} | {n} kishtein · har mahine ₹{amount} |
| legendValue | Value | Value | Value |
| legendInvested | Invested | लगाया | Lagaya |
| stop | Stop SIP | SIP रोकें | SIP roko |
| stopNote | In the real app this stops future instalments. This concept doesn't change anything. | असली app में इससे आगे की किस्तें रुक जाती हैं। ये concept कुछ नहीं बदलता। | Asli app mein isse aage ki kishtein ruk jaati hain. Ye concept kuch nahi badalta. |

The change shows ▲ or ▼ with a + or − sign, in green or red. It never relies on colour alone.

## 4. Replay

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| next | Next month | अगला महीना | Agla mahina |
| restart | Back to start | शुरू से | Shuru se |
| noSetback | No setback in your first year: at every month-end from month 4 to 12, your value stayed above what you put in. | पहले साल में कोई setback नहीं: महीना 4 से 12 तक हर महीने के आख़िर में आपकी value लगाए हुए पैसे से ऊपर रही। | Pehle saal mein koi setback nahi: mahina 4 se 12 tak har mahine ke aakhir mein aapki value lagaye hue paise se upar rahi. |
| seeSample | See the sample SIP | Sample SIP देखें | Sample SIP dekho |

## 5. Helper card

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| hello | Hi, I'm here to help you understand what happened. | नमस्ते, मैं ये समझने में आपकी मदद के लिए हूँ कि क्या हुआ। | Namaste, main ye samajhne mein aapki madad ke liye hoon ki kya hua. |
| ask | Your ₹{invested} is now ₹{value}. What do you think happened? | आपके ₹{invested} अब ₹{value} हैं। आपको क्या लगता है, क्या हुआ? | Aapke ₹{invested} ab ₹{value} hain. Aapko kya lagta hai, kya hua? |
| optFund | My fund did badly | मेरा fund खराब चला | Mera fund kharab chala |
| optMarket | The whole market fell | पूरा market गिरा | Poora market gira |
| optDunno | I don't know | पता नहीं | Pata nahi |
| optWorth | It doesn't feel worth it | ये worth it नहीं लग रहा | Ye worth it nahi lag raha |
| barMarket | Whole market (Nifty 50) | पूरा market (Nifty 50) | Poora market (Nifty 50) |
| barFund | Your fund | आपका fund | Aapka fund |
| checked | ✓ Every number checked against your data | ✓ हर number आपके data से check किया गया | ✓ Har number aapke data se check kiya gaya |
| got | Got it | समझ गया | Samajh gaya |
| more | Ask more | और पूछो | Aur poochho |

### 5a. Which case applies (worked out in code from the setback month)

"Close" means the fund move is within 1.5 percentage points of the market move. This is an assumption to tune.

| Case | When |
|---|---|
| SAME | Both fell, and they are close |
| FUND_MORE | Both fell, and the fund fell more than 1.5 points more |
| FUND_LESS | Both fell, and the fund fell more than 1.5 points less |
| MARKET_UP | The market rose or stayed flat, and the fund fell |
| FUND_UP | The fund rose this month, but the value is still below invested |

### 5b. Reason templates (also the safe version when the AI check fails)

| Case | English | हिंदी | Hinglish |
|---|---|---|---|
| SAME | This month the whole market (Nifty 50) fell {m}. Your fund fell {f}, about the same as the market. | इस महीने पूरा market (Nifty 50) {m} गिरा। आपका fund {f} गिरा, लगभग market जितना ही। | Is mahine poora market (Nifty 50) {m} gira. Aapka fund {f} gira, lagbhag market jitna hi. |
| FUND_MORE | This month the whole market (Nifty 50) fell {m}. Your fund fell more, {f}. So part of this fall is the market and part is your fund. | इस महीने पूरा market (Nifty 50) {m} गिरा। आपका fund उससे ज़्यादा, {f} गिरा। यानी गिरावट का कुछ हिस्सा market का है और कुछ आपके fund का। | Is mahine poora market (Nifty 50) {m} gira. Aapka fund usse zyada, {f} gira. Yaani girawat ka kuch hissa market ka hai aur kuch aapke fund ka. |
| FUND_LESS | This month the whole market (Nifty 50) fell {m}. Your fund fell less, {f}. | इस महीने पूरा market (Nifty 50) {m} गिरा। आपका fund उससे कम, {f} गिरा। | Is mahine poora market (Nifty 50) {m} gira. Aapka fund usse kam, {f} gira. |
| MARKET_UP | This month the whole market (Nifty 50) rose {m}, but your fund fell {f}. This fall comes from your fund, not the whole market. | इस महीने पूरा market (Nifty 50) {m} बढ़ा, लेकिन आपका fund {f} गिरा। ये गिरावट आपके fund की है, पूरे market की नहीं। | Is mahine poora market (Nifty 50) {m} badha, lekin aapka fund {f} gira. Ye girawat aapke fund ki hai, poore market ki nahi. |
| FUND_UP | Your fund rose {f} this month, but your value is still ₹{gap} below what you put in. Some of your instalments bought units at a higher price than today's. | इस महीने आपका fund {f} बढ़ा, फिर भी आपकी value लगाए हुए पैसे से ₹{gap} कम है। आपकी कुछ किस्तों ने units आज से ऊँची कीमत पर खरीदे थे। | Is mahine aapka fund {f} badha, phir bhi aapki value lagaye hue paise se ₹{gap} kam hai. Aapki kuch kishton ne units aaj se oonchi keemat par khareede the. |

### 5c. Opening line, by guess and case (comes before the reason)

| Guess | Case | English | हिंदी | Hinglish |
|---|---|---|---|---|
| fund | SAME, FUND_LESS | This fall isn't just your fund. | ये गिरावट सिर्फ़ आपके fund की नहीं है। | Ye girawat sirf aapke fund ki nahi hai. |
| fund | FUND_MORE | Partly right. | आधा सही। | Aadha sahi. |
| fund | MARKET_UP | You read it right. | आपने सही समझा। | Aapne sahi samjha. |
| fund | FUND_UP | Your fund didn't fall this month. | इस महीने आपका fund नहीं गिरा। | Is mahine aapka fund nahi gira. |
| market | SAME, FUND_LESS | You read it right. | आपने सही समझा। | Aapne sahi samjha. |
| market | FUND_MORE | Partly right. | आधा सही। | Aadha sahi. |
| market | MARKET_UP, FUND_UP | Not quite. | पूरी तरह नहीं। | Poori tarah nahi. |
| dunno | any | That's a common question. | कोई बात नहीं, ये सवाल बहुत लोगों का होता है। | Koi baat nahi, ye sawaal bahut logon ka hota hai. |
| dunno | SAME, FUND_LESS (second line) | Your money moves with the share market. | आपका पैसा share market के साथ ऊपर-नीचे होता है। | Aapka paisa share market ke saath upar-neeche hota hai. |
| worth | any | Your {months} months so far: you've put in ₹{invested}, and today it's worth ₹{value}. | आपके {months} महीनों का हिसाब: आपने ₹{invested} लगाए, आज उनकी value ₹{value} है। | Aapke {months} mahino ka hisaab: aapne ₹{invested} lagaye, aaj unki value ₹{value} hai. |

**Misread:** the guess does not match the case: "fund" with SAME, FUND_LESS or FUND_UP; "market" with MARKET_UP or FUND_UP. Code records it for "falls read correctly".

### 5d. Reason line (stays next to the value after "Got it")

| English | हिंदी | Hinglish |
|---|---|---|
| {month}: market {fell/rose} {m}, your fund {fell/rose} {f}. | {month}: market {m} {गिरा/बढ़ा}, आपका fund {f} {गिरा/बढ़ा}। | {month}: market {m} {gira/badha}, aapka fund {f} {gira/badha}. |

## 6. Follow-up ("Ask more")

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| title | Ask more | और पूछो | Aur poochho |
| hint | Ask anything about your SIP | अपनी SIP के बारे में कुछ भी पूछें | Apni SIP ke baare mein kuch bhi poochiye |
| send | Send | भेजें | Bhejo |
| back | Back | वापस | Wapas |

**Suggested questions (tap to ask):**

| Kind | English | हिंदी | Hinglish |
|---|---|---|---|
| answer | What happens if I stop now? | अगर मैं अभी रोक दूँ तो क्या होगा? | Agar main abhi rok doon to kya hoga? |
| answer | Did my fund do worse than the market? | क्या मेरा fund market से खराब चला? | Kya mera fund market se kharab chala? |
| safe | Should I switch to another fund? | क्या मुझे दूसरा fund ले लेना चाहिए? | Kya mujhe doosra fund le lena chahiye? |
| safe | How long will this fall last? | ये गिरावट कब तक रहेगी? | Ye girawat kab tak rahegi? |

**Safe answers (fixed text, never written by the AI):**

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| safeAdvice | I can't tell you what to do with your money, like which fund to pick or whether to stop. That would be investment advice. AMFI explains how funds work in plain language: mutualfundssahihai.com | मैं ये नहीं बता सकता कि आप अपने पैसे का क्या करें, जैसे कौन सा fund लें या SIP रोकें या नहीं। ये निवेश सलाह होगी। Fund कैसे काम करते हैं, ये AMFI ने आसान भाषा में समझाया है: mutualfundssahihai.com | Main ye nahi bata sakta ki aap apne paise ka kya karein, jaise kaunsa fund lein ya SIP rokein ya nahi. Ye investment advice hogi. Fund kaise kaam karte hain, ye AMFI ne aasaan bhasha mein samjhaya hai: mutualfundssahihai.com |
| safePredict | I can't tell you what the market will do next, and nobody can say for sure. I can only tell you what has happened to your money so far. | आगे market क्या करेगा, ये मैं नहीं बता सकता, और कोई भी पक्का नहीं बता सकता। मैं बस ये बता सकता हूँ कि अब तक आपके पैसे के साथ क्या हुआ। | Aage market kya karega, ye main nahi bata sakta, aur koi bhi pakka nahi bata sakta. Main bas ye bata sakta hoon ki ab tak aapke paise ke saath kya hua. |
| safeOff | I can only answer questions about this SIP and what happened to it. | मैं सिर्फ़ इस SIP और इसके साथ क्या हुआ, इसी के बारे में बता सकता हूँ। | Main sirf is SIP aur iske saath kya hua, isi ke baare mein bata sakta hoon. |
| adviser | For advice on your own situation, you can speak to a SEBI-registered investment adviser. | अपनी स्थिति पर सलाह के लिए आप किसी SEBI-registered investment adviser से बात कर सकते हैं। | Apni situation par salaah ke liye aap kisi SEBI-registered investment adviser se baat kar sakte hain. |

Links: English uses https://www.mutualfundssahihai.com/en and Hindi and Hinglish use https://www.mutualfundssahihai.com/hi (both checked, open on 2 Nov 2026).

**Stopping facts the AI may use** (for "what happens if I stop"): stopping ends future instalments; the money already in stays in the fund until the person withdraws it; many equity funds charge an exit load (often 1%) if units are withdrawn within a year, and the fund's own page has the exact rule. The exit load amount is worked out in code from the value, and labelled "about".

## 7. Words the guards look for (starting lists; the Phase 3 agent extends and tests them)

**A question is advice or prediction if it asks** (catch in code before any AI call):

| Kind | English | Hindi and Hinglish |
|---|---|---|
| Advice | should I, which fund, best fund, good fund, recommend, suggest, switch, buy, sell, redeem now, stop or continue, is it safe to | kaunsa fund / कौन सा fund, konsa, best fund, accha fund / अच्छा fund, lena chahiye / लेना चाहिए, band kar du / बंद कर दूँ, rok du / रोक दूँ, chalu rakhu / चालू रखूँ, switch karu, nikal lu / निकाल लूँ, kya karu / क्या करूँ |
| Prediction | will it, when will, how long will, recover, go up, come back, next year, future, expected return, how much will I get | kab tak / कब तक, kab badhega / कब बढ़ेगा, upar jayega / ऊपर जाएगा, wapas aayega / वापस आएगा, recover hoga, girega / गिरेगा, agle saal / अगले साल, kitna milega / कितना मिलेगा |

"What happens if I stop" is a facts question, not advice: answer it.

**A written reply fails if it contains** (check on every AI reply; the fixed safe answers are not checked):

| Kind | English | Hindi and Hinglish |
|---|---|---|
| Advice or nudge | you should, I recommend, I suggest, better to, consider switching, keep going, stay invested, don't stop, don't worry, good time to, best fund | chahiye / चाहिए (in a reply), jaari rakhein / जारी रखें, mat rokiye / मत रोकिए, band mat / बंद मत, chinta mat / चिंता मत, ghabraiye mat / घबराइए मत, sahi samay / सही समय |
| Prediction | will recover, will rise, will fall, will go up, will come back, expected to, likely to, guaranteed, always recovers, in the long run you will | badhega / बढ़ेगा, girega / गिरेगा, wapas aayega / वापस आएगा, recover hoga / recover होगा, pakka / पक्का (about the future), guarantee |

## 8. Tester mode (`/test`)

| Key | English | हिंदी | Hinglish |
|---|---|---|---|
| intro | Thanks for helping. This takes about 5 minutes. There are no right or wrong answers. | मदद के लिए शुक्रिया। इसमें लगभग 5 मिनट लगेंगे। कोई जवाब सही या गलत नहीं है। | Madad ke liye shukriya. Ismein lagbhag 5 minute lagenge. Koi jawab sahi ya galat nahi hai. |
| q1 | Your SIP value is below what you put in. What happened to your money? | आपकी SIP की value लगाए हुए पैसे से कम है। आपके पैसे के साथ क्या हुआ? | Aapki SIP ki value lagaye hue paise se kam hai. Aapke paise ke saath kya hua? |
| q1a | Something about my fund | मेरे fund में कुछ गड़बड़ | Mere fund mein kuch gadbad |
| q1b | The whole market fell | पूरा market गिरा | Poora market gira |
| q1c | I don't know | पता नहीं | Pata nahi |
| q2 | Would you keep your SIP going? | क्या आप अपनी SIP चालू रखेंगे? | Kya aap apni SIP chalu rakhenge? |
| q2a | Yes | हाँ | Haan |
| q2b | Not sure | पक्का नहीं | Pakka nahi |
| q2c | No | नहीं | Nahi |
| before | First, before you see anything new: | कुछ नया देखने से पहले: | Kuch naya dekhne se pehle: |
| after | Now, after using it: | अब, इस्तेमाल करने के बाद: | Ab, use karne ke baad: |
| thanks | Thank you. That's all. | शुक्रिया। बस इतना ही। | Shukriya. Bas itna hi. |

The tester's answers are saved as anonymous events only: no name, no phone.
