import { describe, expect, test } from "vitest";
import { CONSENT_KEY, CONSENT_VERSION, consentRenewsAt, currentConsentAcceptedAt, saveConsent } from "./consent";

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
}

const now = new Date("2026-11-03T10:00:00Z");

describe("consent", () => {
  test("a saved consent counts for five hours, then the notice shows again", () => {
    const store = memoryStore();
    expect(saveConsent(store, now)).toBe(true);
    expect(currentConsentAcceptedAt(store, new Date("2026-11-03T14:59:00Z"))).toEqual(now);
    expect(currentConsentAcceptedAt(store, new Date("2026-11-03T15:00:00Z"))).toBeNull();
    expect(consentRenewsAt(now)).toEqual(new Date("2026-11-03T15:00:00Z"));
  });

  test("an older wording or a broken record asks again", () => {
    expect(currentConsentAcceptedAt(memoryStore({ [CONSENT_KEY]: JSON.stringify({ version: CONSENT_VERSION - 1, acceptedAt: now.toISOString() }) }), now)).toBeNull();
    expect(currentConsentAcceptedAt(memoryStore({ [CONSENT_KEY]: "{not json" }), now)).toBeNull();
    expect(currentConsentAcceptedAt(null, now)).toBeNull();
  });

  test("a store that refuses to save still lets the visit go on", () => {
    const refusing = { getItem: () => null, setItem: () => { throw new Error("blocked"); } };
    expect(saveConsent(refusing, now)).toBe(false);
  });
});
