"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { DEFAULT_LANG, HTML_LANG, LANGS, t } from "@/lib/copy/dictionary";
import type { Entry, Lang, TemplateValues } from "@/lib/copy/dictionary";
import { useStoredChoice } from "@/hooks/use-stored-choice";

const STORAGE_KEY = "sip-ai-lang";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue>({ lang: DEFAULT_LANG, setLang: () => {} });

/** English by default. The person's choice is remembered on this device and applies to every screen. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useStoredChoice<Lang>(STORAGE_KEY, LANGS, DEFAULT_LANG);

  // The page language tells screen readers and the browser which script to expect (Hinglish is Hindi in Latin letters).
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Returns a function that writes one dictionary entry in the current language, with its braces filled. */
export function useT() {
  const { lang } = useLang();
  return useCallback((entry: Entry, values?: TemplateValues) => t(entry, lang, values), [lang]);
}
