"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

export type LayoutMode = "phone" | "desktop";

/** Phone unless the reviewer picked Desktop on a screen wide enough to hold the two-column page. */
export const LayoutModeContext = createContext<LayoutMode>("phone");

export function useLayoutMode(): LayoutMode {
  return useContext(LayoutModeContext);
}

const QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** True on a screen at least 1024 px wide. False on the server and the first paint, so nothing mismatches. */
export function useWideScreen(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
