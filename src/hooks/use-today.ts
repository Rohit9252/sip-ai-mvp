"use client";

import { useSyncExternalStore } from "react";
import { todayInIndia } from "@/lib/api/today";

const subscribeNever = () => () => {};

/**
 * Today in India as "yyyy-mm-dd", or null on the server and on the first paint.
 * The page is built ahead of time, so the date is only read in the browser.
 */
export function useToday(): string | null {
  return useSyncExternalStore(subscribeNever, () => todayInIndia(), () => null);
}
