"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A small choice (the language, the phone or desktop view) remembered in localStorage.
 * Storage can be blocked (a private window, cleared site data), so every read and write is in try/catch and the
 * choice is also kept in memory for the visit. The server and the first paint use `fallback`, so nothing mismatches.
 */

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) return stored;
  } catch {
    // Storage is blocked: fall back to memory below.
  }
  return memory.get(key) ?? null;
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Remembering the choice is a convenience. The choice still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useStoredChoice<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const stored = read(key);
      return (allowed as readonly string[]).includes(stored ?? "") ? (stored as T) : fallback;
    },
    () => fallback,
  );
  const choose = useCallback((next: T) => write(key, next), [key]);
  return [value, choose] as const;
}
