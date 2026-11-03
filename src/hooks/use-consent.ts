"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { browserStore, currentConsentAcceptedAt, saveConsent } from "@/lib/consent";

/** "checking" holds on the server and the first paint, so a returning person never sees the notice flash. */
export type ConsentStatus = "checking" | "needed" | "given";

const listeners = new Set<() => void>();
const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

export function useConsent() {
  // The stored record, read as text so the snapshot stays stable between renders.
  const stored = useSyncExternalStore(
    subscribe,
    () => currentConsentAcceptedAt(browserStore())?.toISOString() ?? "",
    () => null,
  );
  // Consent given in this visit when the browser would not store it.
  const [visitOnly, setVisitOnly] = useState(false);

  const status: ConsentStatus = stored === null ? "checking" : stored || visitOnly ? "given" : "needed";
  const acceptedAt = stored ? new Date(stored) : null;

  const accept = useCallback(() => {
    if (!saveConsent(browserStore(), new Date())) setVisitOnly(true);
    listeners.forEach((l) => l());
  }, []);

  return { status, acceptedAt, accept };
}
