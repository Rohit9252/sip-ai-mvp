"use client";

import { copy, HTML_LANG, LANGS } from "@/lib/copy/dictionary";
import type { Lang } from "@/lib/copy/dictionary";
import { Segmented } from "@/components/ui/segmented";
import { useLang, useT } from "./lang-provider";

/** English, हिंदी and Hinglish, on every screen. Each name is written in its own language. */
export function LangSwitch() {
  const { lang, setLang } = useLang();
  const t = useT();
  return (
    <Segmented<Lang>
      size="sm"
      label={t(copy.common.langLabel)}
      value={lang}
      onChange={setLang}
      options={LANGS.map((l) => ({ value: l, label: copy.common.langName[l], lang: HTML_LANG[l] }))}
    />
  );
}
