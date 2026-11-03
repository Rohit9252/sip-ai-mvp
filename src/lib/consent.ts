/**
 * The first-visit consent, as in the attempt-one MVP: a versioned record in localStorage that counts for five hours,
 * so a returning tester reads the notice again. Raise CONSENT_VERSION whenever the wording about data or limits
 * changes, so everyone agrees to the current wording.
 */

export const CONSENT_KEY = "sip-ai-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_LIFETIME_MS = 5 * 60 * 60 * 1000;
/** Allows for a device clock that runs slightly behind the one that saved the record. */
const CLOCK_SKEW_MS = 60 * 1000;

export type ConsentRecord = { version: number; acceptedAt: string };
export type ConsentStore = Pick<Storage, "getItem" | "setItem">;

/** When the current consent was given, or null for a missing, malformed, older or expired record. */
export function currentConsentAcceptedAt(store: ConsentStore | null, now: Date = new Date()): Date | null {
  if (!store) return null;
  try {
    const raw = store.getItem(CONSENT_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as Partial<ConsentRecord> | null;
    if (record?.version !== CONSENT_VERSION || typeof record.acceptedAt !== "string") return null;
    const acceptedAt = Date.parse(record.acceptedAt);
    if (Number.isNaN(acceptedAt)) return null;
    const age = now.getTime() - acceptedAt;
    return age >= -CLOCK_SKEW_MS && age < CONSENT_LIFETIME_MS ? new Date(acceptedAt) : null;
  } catch {
    return null;
  }
}

/** When a consent given at `acceptedAt` stops counting and the notice shows again. */
export function consentRenewsAt(acceptedAt: Date): Date {
  return new Date(acceptedAt.getTime() + CONSENT_LIFETIME_MS);
}

/** Saves the consent. False when the browser will not store it; the app still continues for this visit. */
export function saveConsent(store: ConsentStore | null, now: Date): boolean {
  if (!store) return false;
  try {
    store.setItem(CONSENT_KEY, JSON.stringify({ version: CONSENT_VERSION, acceptedAt: now.toISOString() } satisfies ConsentRecord));
    return true;
  } catch {
    return false;
  }
}

/** The browser's localStorage, or null when a private window or blocked site data makes it unreachable. */
export function browserStore(): ConsentStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
