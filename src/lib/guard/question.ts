/**
 * Questions that ask for advice or a prediction are caught here, in code, before any AI call (TODO T3.2).
 * No wording of the prompt can then talk the model into naming a fund or a future. The prompt keeps its own rule
 * as a second layer for phrasings these patterns miss. Starting lists: docs/reference/copy.md, section 7.
 */

export type QuestionKind = "advice" | "prediction" | "ok";

const ADVICE: RegExp[] = [
  // "which fund is good for me", "best small cap fund", "suggest a fund" (from the discovery engine's guard)
  /\b(which|what|best|good|top|better|right|ideal|safest)\b.{0,40}\b(funds?|mf|mutual funds?|sips?|scheme|portfolio|stocks?|etfs?|index)\b.{0,30}\b(for me|to (buy|pick|choose|invest|start|add)|should i|i should|is (good|best|better))\b/i,
  /\b(best|top|good|safest|better)\b.{0,25}\b(small|mid|large|flexi|multi|index|elss|debt|hybrid|value|gold|nifty|cap)\b.{0,15}\b(funds?|mf|sips?)\b/i,
  /\b(suggest|recommend|advise)\b/i,
  // "should I stop / switch / sell", "is it a good time to invest"
  /\b(should|shall|must)\s+i\b/i,
  /\b(is it (a )?good time|right time|when should i)\b/i,
  /\bhow much\b.{0,20}\bshould\b/i,
  /\bwhere (should|can|do) i (invest|put|park)\b/i,
  /\b(is|was)\b.{0,40}\b(a )?(good|bad|right|wrong|safe)\b.{0,10}\b(fund|choice|sip|investment|idea)\b/i,
  // "is it safe to keep", "is my fund risky", "are index funds better", "is my friend right"
  /\b(safe|risky|worth it|worth keeping|good idea|bad idea)\b.{0,25}\b(keep|hold|continue|stay|invest|stop)\b/i,
  /\b(is|are)\b.{0,40}\b(safe|safer|risky|reliable|trustworthy)\b/i,
  /\b(index funds?|other funds?|another fund|fds?|fixed deposits?|gold|stocks?|real estate)\b.{0,30}\b(better|safer|best|worse)\b/i,
  /\b(better|safer|best)\b.{0,30}\b(index funds?|other funds?|another fund|fds?|fixed deposits?|gold|stocks?)\b/i,
  /\b(is|are) (he|she|they|my (friend|brother|father|colleague|uncle|dad|bhai))\b.{0,10}\bright\b/i,
  /\b(safe|risky|bharosa|bharose)\b.{0,15}\b(hai|hain)\b/i,
  /(सुरक्षित|safe|रिस्की|भरोसे).{0,15}(है|हैं)/,
  // Hinglish: "kaunsa fund lu", "band kar du", "rok du", "nikal lu", "chalu rakhu", "kya karu", "lena chahiye"
  /\b(kaun ?sa|kon ?sa|konsa|kaunsa|kis)\b.{0,25}\b(fund|mf|sip|scheme)\b/i,
  /\b(band|rok|bech|nikal|switch|badal|chalu|jaari|continue)\w*\b.{0,12}\b(du|doon|dun|du\?|karu|karoon|kar du|kar doon|lu|loon|lun|rakhu|rakhoon|rakhun)\b/i,
  /\bkya kar(u|oon|un|na chahiye)\b/i,
  /\bchahiye\b/i,
  /\b(accha|acha|sahi|best|badiya|badhiya)\b.{0,20}\b(fund|sip|choice)\b.{0,20}\b(hai|tha)\b.{0,5}\?/i,
  // Hindi in Devanagari
  /(कौन ?सा|कौनसा|किस)\s*.{0,20}(fund|फंड|फण्ड|scheme|स्कीम)/i,
  /(बंद|रोक|निकाल|बेच|बदल|चालू|जारी).{0,12}(दूँ|दूं|दू|लूँ|लूं|लू|करूँ|करूं|करू|रखूँ|रखूं|रखू)/,
  /क्या कर(ूँ|ूं|ू|ना चाहिए)/,
  /चाहिए/,
];

const PREDICTION: RegExp[] = [
  /\b(when|how long|how soon)\b.{0,30}\b(recover|come back|go up|rise|last|improve|end|turn|bounce|be back)\b/i,
  /\bwill\b.{0,30}\b(recover|rise|go up|come back|fall|drop|crash|improve|grow|bounce|double|be (positive|negative|back))\b/i,
  /\b(future|next year|next month|next week|in \d+ years?|expected return|predict|forecast|outlook)\b/i,
  /\bhow much will i (get|make|earn|have)\b/i,
  // Hinglish
  /\bkab tak\b/i,
  /\bkab\b.{0,20}\b(badhega|badhegi|upar|recover|wapas|theek|sudhrega|sudhregi)\b/i,
  /\b(badhega|badhegi|badhenge|girega|giregi|girenge|upar jayega|upar jaega|upar jaayega|wapas aayega|wapas aaega|recover hoga|kitna milega|kitna banega|agle saal|aage kya hoga)\b/i,
  // Hindi in Devanagari
  /(कब तक|बढ़ेगा|बढ़ेगी|बढ़ेंगे|गिरेगा|गिरेगी|गिरेंगे|ऊपर जाएगा|वापस आएगा|कितना मिलेगा|कितना बनेगा|अगले साल|भविष्य|आगे क्या होगा)/,
];

/**
 * "What happens if I stop now?" is a facts question, not advice: it asks what stopping does, not whether to stop.
 * It is let through before the advice patterns run.
 */
const FACTS_ABOUT_STOPPING: RegExp[] = [
  /\bwhat (happens|will happen|would happen)\b.{0,20}\bif i\b/i,
  /\b(agar|agr)\b.{0,30}\b(to|toh)\b.{0,10}\bkya (hoga|hota)\b/i,
  /अगर.{0,30}तो क्या (होगा|होता)/,
];

export function classifyQuestion(question: string): QuestionKind {
  const q = question.trim();
  const aboutStopping = FACTS_ABOUT_STOPPING.some((p) => p.test(q));
  if (!aboutStopping && ADVICE.some((p) => p.test(q))) return "advice";
  if (PREDICTION.some((p) => p.test(q))) return "prediction";
  return "ok";
}
