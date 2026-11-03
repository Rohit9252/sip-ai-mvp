"use client";

import { useState, type ReactNode } from "react";
import { useStoredChoice } from "@/hooks/use-stored-choice";
import { MonitorIcon, PhoneIcon } from "@/components/icons";
import { OverlayLayerContext } from "./overlay-layer";
import { LayoutModeContext, useWideScreen } from "./layout-mode";

export type DeviceMode = "desktop" | "phone";
const MODES = ["desktop", "phone"] as const;
const STORAGE_KEY = "sip-ai-device-view";

/**
 * On a wide screen, a switch shows the app inside a phone frame or as a full desktop page, so a reviewer can see both
 * from one link. Desktop is a real page with its own two-column layout, not a stretched phone. On a real phone
 * (under 640 px wide) there is no switch and no frame: the app fills the screen. That choice is made by a CSS
 * viewport query (see globals.css), not by JavaScript, so a phone never sees a flash.
 */
export function DeviceShell({ children }: { children: ReactNode }) {
  // Desktop is the default on a wide screen: most reviewers open the link on a laptop.
  const [mode, choose] = useStoredChoice<DeviceMode>(STORAGE_KEY, MODES, "desktop");
  const wide = useWideScreen();
  const [overlayHost, setOverlayHost] = useState<HTMLDivElement | null>(null);
  const layout = mode === "desktop" && wide ? "desktop" : "phone";

  return (
    <LayoutModeContext.Provider value={layout}>
      <OverlayLayerContext.Provider value={overlayHost}>
        <div className="shell" data-view={wide ? mode : "phone"}>
          <div className="shell-switch" role="group" aria-label="View">
            <ViewButton label="Desktop" icon={<MonitorIcon />} active={mode === "desktop"} onClick={() => choose("desktop")} />
            <ViewButton label="Phone" icon={<PhoneIcon />} active={mode === "phone"} onClick={() => choose("phone")} />
          </div>
          <div className="shell-stage">
            <div className="device" data-testid="device">
              <div className="screen" data-testid="screen">
                <span className="notch" aria-hidden />
                {children}
                <span className="home-bar" aria-hidden />
                <div ref={setOverlayHost} className="overlay-host" />
              </div>
            </div>
          </div>
        </div>
      </OverlayLayerContext.Provider>
    </LayoutModeContext.Provider>
  );
}

function ViewButton({ label, icon, active, onClick }: { label: string; icon: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
        active ? "bg-ink text-paper" : "text-ink hover:bg-surface-strong"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
