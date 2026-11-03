"use client";

import { useState } from "react";
import { copy } from "@/lib/copy/dictionary";
import { setupTour, sipTour } from "@/lib/copy/tour";
import type { ApiError, SipResponse } from "@/lib/api/types";
import type { SipRequest } from "@/lib/setup/rules";
import { SAMPLE_SIP } from "@/lib/sip/sample";
import { useT } from "@/components/lang/lang-provider";
import { Strip } from "@/components/strip";
import { SetupScreen } from "@/components/setup/setup-screen";
import { SipScreen } from "@/components/sip/sip-screen";
import { Tour, useTour } from "@/components/tour/tour";
import { track } from "@/lib/events";

type View =
  | { kind: "setup"; problem?: "load" | "tooNew" }
  | { kind: "loading" }
  | { kind: "sip"; data: SipResponse; isSample: boolean };

export const SAMPLE_REQUEST: SipRequest = {
  schemeCode: SAMPLE_SIP.schemeCode,
  startMonth: SAMPLE_SIP.startMonth,
  monthlyAmount: SAMPLE_SIP.monthlyAmount,
  sipDay: SAMPLE_SIP.sipDay,
};

/**
 * The two screens: set up a SIP (or pick the sample), then the SIP page with its replay and helper. Each screen has a
 * short first-visit tour that spotlights its parts; it shows once, can be skipped, and can be replayed from the top.
 */
export function App() {
  const [view, setView] = useState<View>({ kind: "setup" });
  const t = useT();
  const setupGuide = useTour("sip-ai-tour-setup");
  const sipGuide = useTour("sip-ai-tour-sip");

  async function open(request: SipRequest, isSample: boolean) {
    setView({ kind: "loading" });
    try {
      const response = await fetch("/api/sip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      const body = (await response.json()) as SipResponse | ApiError;
      if ("error" in body) {
        setView({ kind: "setup", problem: body.error === "fund-too-new" ? "tooNew" : "load" });
        return;
      }
      track("sip_opened", { sample: isSample, setback: body.setback !== null });
      setView({ kind: "sip", data: body, isSample });
    } catch {
      setView({ kind: "setup", problem: "load" });
    }
  }

  const guide = view.kind === "setup" ? setupGuide : view.kind === "sip" ? sipGuide : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Strip onHelp={guide?.start} page={view.kind === "sip" ? "sip" : "setup"} />
      {view.kind === "setup" && (
        <SetupScreen problem={view.problem} onSubmit={(r) => open(r, false)} onSample={() => open(SAMPLE_REQUEST, true)} />
      )}
      {view.kind === "loading" && (
        <div className="flex flex-1 items-center justify-center p-6 text-muted" role="status" aria-live="polite">
          <span className="loader mr-3" aria-hidden />
          {t(copy.common.loading)}
        </div>
      )}
      {view.kind === "sip" && (
        <SipScreen
          key={`${view.data.request.schemeCode}-${view.data.request.startMonth}`}
          data={view.data}
          onBack={() => setView({ kind: "setup" })}
          onSample={() => open(SAMPLE_REQUEST, true)}
        />
      )}
      {view.kind === "setup" && setupGuide.open && <Tour key="setup" steps={setupTour} onClose={setupGuide.close} />}
      {view.kind === "sip" && sipGuide.open && <Tour key="sip" steps={sipTour} onClose={sipGuide.close} />}
    </div>
  );
}
